import os
import django
import sys
import traceback

print("Beginning test_render.py")

try:
    from core.models import Order, User, Product, Vendor, OrderItem, Category
    from core.email_service import send_platform_email
    from django.template.loader import render_to_string
    from django.conf import settings

    # Find the most recent order with items
    order = Order.objects.prefetch_related('items__product__vendor__user').filter(items__isnull=False).order_by('-created_at').first()
    
    if not order:
        print("No order found to test.")
        sys.exit(0)

    print(f"Testing with Order #{order.id}")

    # Generate the context exactly like signals.py
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
    
    # 1. Test Customer Confirmation
    print("Testing Customer Confirmation template...")
    customer_context = {
        'user': order.customer,
        'order': order,
        'items': order.items.all(),
        'order_url': f'{frontend_url}/dashboard/user/orders/{order.id}',
    }
    
    try:
        from django.utils import timezone
        enriched_customer = {
            'current_year': timezone.now().year,
            'frontend_url': settings.FRONTEND_URL,
            'unsubscribe_url': f"{settings.FRONTEND_URL}/user/settings",
            **customer_context
        }
        res1 = render_to_string('emails/order/order_confirmation.html', enriched_customer)
        print("Customer template SUCCESS. Length:", len(res1))
    except Exception as e:
        print("FAIL CUSTOMER:", e)
        traceback.print_exc()

    # 2. Test Vendor Notification
    print("\nTesting Vendor Notification template...")
    vendor_items = {}
    for item in order.items.select_related('product__vendor').all():
        vendor = item.product.vendor
        vendor_items.setdefault(vendor, []).append(item)

    for vendor, items in vendor_items.items():
        print(f"Testing for vendor: {vendor.brand_name}")
        vendor_context = {
            'vendor': vendor,
            'order': order,
            'vendor_items': items,
        }
        try:
            enriched_vendor = {
                'current_year': timezone.now().year,
                'frontend_url': settings.FRONTEND_URL,
                'unsubscribe_url': f"{settings.FRONTEND_URL}/user/settings",
                **vendor_context
            }
            res2 = render_to_string('emails/order/vendor_notification.html', enriched_vendor)
            print("Vendor template SUCCESS. Length:", len(res2))
        except Exception as e:
            print("FAIL VENDOR:", e)
            traceback.print_exc()

except Exception as e:
    print("FATAL ERROR:")
    traceback.print_exc()

print("Done")
