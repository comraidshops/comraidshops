import os
import django
import sys

from core.models import Order, User, Product, Vendor, OrderItem, Category
from django.db import transaction

print("Setting up django...")
# Setup dummy data in case we need it
cat, _ = Category.objects.get_or_create(name='Test Cat')
# Create test objects using get_or_create to avoid duplicates
vendor_user, _ = User.objects.get_or_create(username='test_vendor_user_sig', email='test_vendor@example.com')
vendor, _ = Vendor.objects.get_or_create(user=vendor_user, brand_name='Test Brand', defaults={'commission_rate': 0.10})
product, _ = Product.objects.get_or_create(vendor=vendor, name='Test Prod Sig', price=100.0, category=cat)

customer, _ = User.objects.get_or_create(username='test_cust_user_sig', email='test_cust@example.com')
order = Order.objects.create(customer=customer, payment_status='pending', total_amount=100.0)
OrderItem.objects.create(order=order, product=product, quantity=1, price=100.0)

print(f"Created order {order.id}. Current payment status: {order.payment_status}")
print("Confirming payment...")

try:
    with transaction.atomic():
        order.payment_status = 'confirmed'
        order.save()
    print("Order saved successfully.")
    
    # Check if VendorEarning was created
    from core.models import VendorEarning, VendorNotification, Notification
    earnings = VendorEarning.objects.filter(order=order)
    print(f"Earnings created: {earnings.count()}")
    for e in earnings:
        print(f" - Earning: gross={e.gross_amount}, commission={e.commission_amount}, net={e.net_amount}")
        
    v_notes = VendorNotification.objects.filter(vendor=vendor)
    print(f"Vendor notifications: {v_notes.count()}")
    for vn in v_notes:
        print(f" - {vn.message}")
        
    notes = Notification.objects.filter(user=customer)
    print(f"Customer notifications: {notes.count()}")
    for n in notes:
        print(f" - {n.title}: {n.body}")

except Exception as e:
    import traceback
    print(f"Exception caught during save: {e}")
    traceback.print_exc()
