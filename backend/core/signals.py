from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender='core.OrderItem')
def create_commission_and_earning(sender, instance, created, **kwargs):
    if created:
        from .models import Commission, VendorEarning
        product = instance.product
        vendor = product.vendor
        
        # Calculate financials based on Markup System:
        # User pays Price (which includes markup). 
        # Base Price = Price / (1 + Rate)
        # Commission (Markup) = Price - Base Price
        retail_total = instance.price * instance.quantity
        commission_rate = vendor.commission_rate
        
        # Reverse the markup to find the vendor's base share
        vendor_earning_amount = retail_total / (1 + commission_rate)
        commission_amount = retail_total - vendor_earning_amount
        
        # Create Commission record
        Commission.objects.create(
            vendor=vendor,
            order=instance.order,
            product=product,
            commission_rate=commission_rate,
            commission_amount=commission_amount
        )
        
        # Create or update VendorEarning for this order
        earning, _ = VendorEarning.objects.get_or_create(
            vendor=vendor,
            order=instance.order,
            defaults={
                'gross_amount': 0,
                'commission_amount': 0,
                'net_amount': 0,
                'status': 'pending'
            }
        )
        earning.gross_amount += retail_total
        earning.commission_amount += commission_amount
        earning.net_amount += vendor_earning_amount
        earning.save()

@receiver(post_save, sender='core.Order')
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    - Notifies the buying customer when their order is paid or completed.
    - Settles vendor earnings when an order is marked 'completed'.
    """
    # --- Buyer notification ---
    if instance.status in ('paid', 'shipped', 'completed', 'cancelled') and not created:
        from .models import Notification
        
        status_labels = {
            'paid': (
                f'Order #{instance.id} Confirmed',
                f'Your order #{instance.id} has been confirmed and is being prepared for dispatch. Total: ${instance.total_amount}.'
            ),
            'shipped': (
                f'Order #{instance.id} Shipped',
                f'Your order #{instance.id} is on its way! We hope you enjoy your acquisition.'
            ),
            'completed': (
                f'Order #{instance.id} Delivered',
                f'Your order #{instance.id} has been delivered. Thank you for shopping with ComraidShops!'
            ),
            'cancelled': (
                f'Order #{instance.id} Cancelled',
                f'Your order #{instance.id} has been cancelled. If this was not expected, please contact support.'
            ),
        }
        title, body = status_labels.get(instance.status, (None, None))
        
        if not title:
            return

        
        # Deduplicate: only create once per status change
        if not Notification.objects.filter(user=instance.customer, title=title).exists():
            Notification.objects.create(
                user=instance.customer,
                title=title,
                body=body,
            )

    # --- Vendor payout settlement ---
    if instance.status == 'completed':
        from .models import VendorEarning, VendorNotification
        pending_earnings = VendorEarning.objects.filter(order=instance, status='pending')
        
        for earning in pending_earnings:
            vendor = earning.vendor
            vendor.payout_balance += earning.net_amount
            vendor.save()
            
            earning.status = 'cleared'
            earning.save()
            
            VendorNotification.objects.create(
                vendor=vendor,
                message=f"Earnings of ${earning.net_amount} from Order #{instance.id} have been added to your balance.",
                type='payment',
                read=False
            )
