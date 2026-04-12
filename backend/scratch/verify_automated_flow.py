import os
import django
import json
import hmac
import hashlib
from django.conf import settings
from django.db.models import F

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Order, Notification, Category, Brand, Vendor, Product, OrderItem
from django.test import Client

def verify():
    # Setup Test Data
    print("--- Setting up test data ---")
    user, _ = User.objects.get_or_create(username='flow_test', email='flow_test@example.com')
    category, _ = Category.objects.get_or_create(name='Test Category')
    brand, _ = Brand.objects.get_or_create(name='Test Brand')
    vendor, _ = Vendor.objects.get_or_create(user=user, brand=brand, brand_name='Test Brand')
    
    # Check initial stock
    product, _ = Product.objects.get_or_create(
        vendor=vendor, category=category, name='Flow Test Product', defaults={'price': 100.00, 'stock': 10}
    )
    initial_stock = product.stock
    print(f"Initial Product Stock: {initial_stock}")

    # Create Order (reduces stock manually as code would)
    order = Order.objects.create(
        customer=user,
        total_amount=100.00,
        payment_status='pending',
        order_status='pending'
    )
    OrderItem.objects.create(order=order, product=product, quantity=1, price=100.00)
    
    product.stock = F('stock') - 1
    product.save()
    product.refresh_from_db()
    print(f"Stock after order creation: {product.stock}")

    client = Client()
    webhook_url = '/api/paystack/webhook/'
    secret = getattr(settings, 'PAYSTACK_SECRET_KEY', 'sk_test_placeholder')

    # 1. Test SUCCESS Webhook -> Should move to 'processing'
    print("\n--- Testing SUCCESS -> PROCESSING ---")
    success_payload = {
        "event": "charge.success",
        "data": {
            "metadata": {"order_id": order.id},
            "amount": 10000
        }
    }
    body = json.dumps(success_payload)
    sig = hmac.new(secret.encode('utf-8'), body.encode('utf-8'), hashlib.sha512).hexdigest()
    client.post(webhook_url, body, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=sig)
    
    order.refresh_from_db()
    print(f"Order Payment Status: {order.payment_status}")
    print(f"Order Status: {order.order_status}")
    if order.order_status == 'processing':
        print("PASS: Automated transition to processing worked.")

    # 2. Test FAILURE Webhook -> Should move to 'cancelled' and RESTORE STOCK
    print("\n--- Testing FAILURE -> CANCELLED + STOCK RESTORE ---")
    order2 = Order.objects.create(
        customer=user,
        total_amount=100.00,
        payment_status='pending',
        order_status='pending'
    )
    OrderItem.objects.create(order=order2, product=product, quantity=1, price=100.00)
    
    # Simulation of stock reduction at checkout
    product.stock = F('stock') - 1
    product.save()
    product.refresh_from_db()
    stock_before_fail = product.stock
    print(f"Stock before failure event: {stock_before_fail}")
    
    fail_payload = {
        "event": "charge.failed",
        "data": {
            "metadata": {"order_id": order2.id},
            "amount": 10000
        }
    }
    body_fail = json.dumps(fail_payload)
    sig_fail = hmac.new(secret.encode('utf-8'), body_fail.encode('utf-8'), hashlib.sha512).hexdigest()
    client.post(webhook_url, body_fail, content_type='application/json', HTTP_X_PAYSTACK_SIGNATURE=sig_fail)
    
    order2.refresh_from_db()
    product.refresh_from_db()
    print(f"Order 2 Status: {order2.order_status}")
    print(f"Product Stock after failure: {product.stock}")
    
    if order2.order_status == 'cancelled' and product.stock > stock_before_fail:
        print("PASS: Automated cancellation and stock restoration worked.")

if __name__ == "__main__":
    verify()
