import os
import django
import json
import hmac
import hashlib
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Order, Notification, Category, Brand, Vendor, Product
from django.test import Client

def verify():
    # Setup Test Data
    print("--- Setting up test data ---")
    user, _ = User.objects.get_or_create(username='notify_test', email='notify_test@example.com')
    category, _ = Category.objects.get_or_create(name='Test Category')
    brand, _ = Brand.objects.get_or_create(name='Test Brand')
    vendor, _ = Vendor.objects.get_or_create(user=user, brand=brand, brand_name='Test Brand')
    product, _ = Product.objects.get_or_create(
        vendor=vendor, category=category, name='Test Product', defaults={'price': 100.00, 'stock': 10}
    )
    
    order = Order.objects.create(
        customer=user,
        total_amount=100.00,
        payment_status='pending'
    )
    print(f"Created Order #{order.id}")

    client = Client()
    webhook_url = '/api/paystack/webhook/' # Corrected path
    secret = getattr(settings, 'PAYSTACK_SECRET_KEY', 'sk_test_placeholder')

    # 1. Test SUCCESS
    print("\n--- Testing SUCCESS Webhook ---")
    success_payload = {
        "event": "charge.success",
        "data": {
            "metadata": {"order_id": order.id, "customer_id": user.id},
            "amount": 10000
        }
    }
    body = json.dumps(success_payload)
    sig = hmac.new(secret.encode('utf-8'), body.encode('utf-8'), hashlib.sha512).hexdigest()
    
    response = client.post(webhook_url, body, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=sig)
    print(f"Response Code: {response.status_code}")
    
    order.refresh_from_db()
    print(f"Order Payment Status: {order.payment_status}")
    
    notifications = Notification.objects.filter(user=user, title__contains=f"Order #{order.id}")
    print(f"Customer Notifications count: {notifications.count()}")
    for n in notifications:
        print(f" - {n.title}: {n.body}")

    # 2. Test FAILURE
    print("\n--- Testing FAILURE Webhook ---")
    order2 = Order.objects.create(
        customer=user,
        total_amount=200.00,
        payment_status='pending'
    )
    print(f"Created Order #{order2.id}")
    
    fail_payload = {
        "event": "charge.failed",
        "data": {
            "metadata": {"order_id": order2.id},
            "amount": 20000
        }
    }
    body_fail = json.dumps(fail_payload)
    sig_fail = hmac.new(secret.encode('utf-8'), body_fail.encode('utf-8'), hashlib.sha512).hexdigest()
    
    response_fail = client.post(webhook_url, body_fail, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=sig_fail)
    print(f"Response Code (Failure): {response_fail.status_code}")
    
    order2.refresh_from_db()
    print(f"Order 2 Payment Status: {order2.payment_status}")
    
    notifications_fail = Notification.objects.filter(user=user, title__contains=f"Failed: Order #{order2.id}")
    print(f"Customer Failure Notifications count: {notifications_fail.count()}")
    for n in notifications_fail:
        print(f" - {n.title}: {n.body}")

if __name__ == "__main__":
    verify()
