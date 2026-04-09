from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from django.db.models import F


# ─────────────────────────────────────────────────────────────────────────────
# IMPORTANT: VendorEarning and Commission are NEVER created on OrderItem save.
# They are ONLY created when admin explicitly sets payment_status = 'confirmed'
# via the AdminOrderViewSet.confirm_payment action.
# ─────────────────────────────────────────────────────────────────────────────

@receiver(pre_save, sender='core.Order')
def capture_previous_order_state(sender, instance, **kwargs):
    """
    Captures the previous payment_status and order_status before save
    so the post_save signal can detect actual transitions.
    """
    if instance.pk:
        try:
            previous = sender.objects.get(pk=instance.pk)
            instance._prev_payment_status = previous.payment_status
            instance._prev_order_status = previous.order_status
        except sender.DoesNotExist:
            instance._prev_payment_status = None
            instance._prev_order_status = None
    else:
        instance._prev_payment_status = None
        instance._prev_order_status = None


@receiver(post_save, sender='core.Order')
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Central handler for all Order state transitions.

    Payment lifecycle:
      PENDING → PAID (Paystack webhook) → CONFIRMED (admin action)
                                       → FAILED (admin rejects / abandoned)

    On CONFIRMED:
      - Create Commission + VendorEarning records (ONLY HERE)
      - Set order_status = processing
      - Notify vendor: "Order ready for processing"
      - Notify customer: "Payment received"

    On DELIVERED:
      - Settle (clear) VendorEarning into payout_balance

    Order status transitions notify the customer.
    """
    if created:
        return

    from .models import Notification, VendorNotification, VendorEarning, Commission, Vendor
    from .email_service import send_platform_email
    from django.conf import settings
    from django.db import transaction

    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')

    prev_payment = getattr(instance, '_prev_payment_status', None)
    prev_order = getattr(instance, '_prev_order_status', None)

    # ─── 1. PAYMENT CONFIRMED TRANSITION ─────────────────────────────────────
    if instance.payment_status == 'confirmed' and prev_payment != 'confirmed':
        import logging
        logger = logging.getLogger(__name__)

        try:
            with transaction.atomic():
                # ── Create Commission & VendorEarning per vendor ──────────────
                vendor_data = {}  # { vendor: {items, retail_total, commission_amount, net_amount} }

                for item in instance.items.select_related('product__vendor').all():
                    vendor = item.product.vendor
                    retail_total = item.price * item.quantity
                    commission_rate = vendor.commission_rate
                    net_amount = retail_total / (1 + commission_rate)
                    commission_amount = retail_total - net_amount

                    # Commission record per item
                    Commission.objects.create(
                        vendor=vendor,
                        order=instance,
                        product=item.product,
                        commission_rate=commission_rate,
                        commission_amount=commission_amount,
                    )

                    # Aggregate per vendor for the VendorEarning record
                    if vendor not in vendor_data:
                        vendor_data[vendor] = {
                            'items': [],
                            'retail_total': 0,
                            'commission_amount': 0,
                            'net_amount': 0,
                        }
                    vendor_data[vendor]['items'].append(item)
                    vendor_data[vendor]['retail_total'] += retail_total
                    vendor_data[vendor]['commission_amount'] += commission_amount
                    vendor_data[vendor]['net_amount'] += net_amount

                for vendor, data in vendor_data.items():
                    earning, was_created = VendorEarning.objects.get_or_create(
                        vendor=vendor,
                        order=instance,
                        defaults={
                            'gross_amount': data['retail_total'],
                            'commission_amount': data['commission_amount'],
                            'net_amount': data['net_amount'],
                            'status': 'pending',
                        }
                    )
                    if not was_created:
                        # Idempotent update (shouldn't normally hit, but safe)
                        VendorEarning.objects.filter(pk=earning.pk).update(
                            gross_amount=data['retail_total'],
                            commission_amount=data['commission_amount'],
                            net_amount=data['net_amount'],
                        )

                # ── Advance order to PROCESSING ───────────────────────────────
                Order = sender
                Order.objects.filter(pk=instance.pk).update(order_status='processing')

        except Exception as e:
            logger.error(
                f"[signals] Error creating earnings for Order #{instance.pk}: {e}"
            )
            return

        # ── Notifications & Emails (non-critical — must never crash) ──────
        try:
            # ── Notify customer ───────────────────────────────────────────
            if instance.customer:
                Notification.objects.get_or_create(
                    user=instance.customer,
                    title=f'Payment Confirmed — Order #{instance.id}',
                    defaults={
                        'body': (
                            f'Great news! Your payment for Order #{instance.id} has been confirmed. '
                            f'Total: ₦{instance.total_amount:,.2f}. Your vendors are preparing your items.'
                        )
                    }
                )

            user_email = getattr(instance.customer, 'email', None) or instance.guest_email
            if user_email:
                send_platform_email(
                    subject=f'Payment Confirmed — Order #{instance.id}',
                    template_name='order/order_confirmation.html',
                    context={
                        'user': instance.customer,
                        'order': instance,
                        'items': instance.items.all(),
                        'order_url': f'{frontend_url}/dashboard/user/orders/{instance.id}',
                    },
                    recipient_list=[user_email],
                )

            # ── Notify each vendor ────────────────────────────────────────
            vendor_items = {}
            for item in instance.items.select_related('product__vendor').all():
                vendor = item.product.vendor
                vendor_items.setdefault(vendor, []).append(item)

            for vendor, items in vendor_items.items():
                VendorNotification.objects.create(
                    vendor=vendor,
                    message=(
                        f'Payment confirmed for Order #{instance.id}. '
                        f'Please begin processing. Items: {", ".join(i.product.name for i in items)}.'
                    ),
                    type='payment_confirmed',
                    read=False,
                )
                if vendor.user.email:
                    send_platform_email(
                        subject=f'New Confirmed Order #{instance.id}',
                        template_name='order/vendor_notification.html',
                        context={
                            'vendor': vendor,
                            'order': instance,
                            'vendor_items': items,
                        },
                        recipient_list=[vendor.user.email],
                    )
        except Exception as e:
            logger.error(
                f"[signals] Non-critical error sending notifications for Order #{instance.pk}: {e}"
            )

    # ─── 2. ORDER STATUS CHANGE NOTIFICATIONS ────────────────────────────────
    if instance.order_status != prev_order:
        from django.db.models import Q

        status_labels = {
            'shipped': (
                f'Order #{instance.id} Shipped',
                f'Your order #{instance.id} is on its way!',
            ),
            'delivered': (
                f'Order #{instance.id} Delivered',
                f'Your order #{instance.id} has been delivered. Thank you for shopping with ComraidShops!',
            ),
            'cancelled': (
                f'Order #{instance.id} Cancelled',
                f'Your order #{instance.id} has been cancelled. If unexpected, please contact support.',
            ),
        }

        title, body = status_labels.get(instance.order_status, (None, None))

        if title and instance.customer:
            Notification.objects.get_or_create(
                user=instance.customer,
                title=title,
                defaults={'body': body}
            )

        if title and (instance.order_status in ('shipped', 'delivered', 'cancelled')):
            user_email = getattr(instance.customer, 'email', None) or instance.guest_email
            if user_email:
                send_platform_email(
                    subject=title,
                    template_name='order/order_status_update.html',
                    context={
                        'user': instance.customer,
                        'order': instance,
                        'message_body': body,
                    },
                    recipient_list=[user_email],
                )

    # ─── 3. DELIVERED — SETTLE VENDOR EARNINGS ───────────────────────────────
    if instance.order_status == 'delivered' and prev_order != 'delivered':
        # Only settle earnings that were created (i.e., from confirmed orders)
        pending_earnings = VendorEarning.objects.filter(order=instance, status='pending')

        for earning in pending_earnings:
            Vendor.objects.filter(pk=earning.vendor_id).update(
                payout_balance=F('payout_balance') + earning.net_amount
            )
            earning.status = 'cleared'
            earning.save(update_fields=['status'])

            VendorNotification.objects.create(
                vendor=earning.vendor,
                message=(
                    f'₦{earning.net_amount:,.2f} from Order #{instance.id} '
                    f'has been added to your payout balance.'
                ),
                type='earnings_cleared',
                read=False,
            )
