import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS = ['*']

from django.db import connection, reset_queries
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from core.models import Vendor

User = get_user_model()

def get_or_create_test_vendor():
    username = "test_audit_vendor"
    user, created = User.objects.get_or_create(username=username, email=f"{username}@example.com")
    if created:
        user.set_password("password123")
        user.is_vendor = True
        user.save()
    
    vendor, _ = Vendor.objects.get_or_create(user=user, defaults={'brand_name': 'Audit Brand'})
    return user

def audit_queries(name, url, user=None):
    client = APIClient()
    if user:
        client.force_authenticate(user=user)
    
    reset_queries()
    response = client.get(url)
    if response.status_code != 200:
        print(f"FAILED: {name} ({url}) - Status {response.status_code}")
        return
    
    query_count = len(connection.queries)
    print(f"{name}: {query_count} queries")

if __name__ == "__main__":
    vendor_user = get_or_create_test_vendor()
    
    endpoints = [
        ("Products List", "/api/products/"),
        ("Brands List", "/api/brands/"),
        ("Featured Brands", "/api/brands/?featured=true"),
        ("Exhibitions List", "/api/exhibitions/"),
        ("FitFrames List", "/api/fitframes/"),
        ("Vendor Dashboard", "/api/vendor/dashboard/", vendor_user),
        ("Vendor Analytics", "/api/vendor/analytics/", vendor_user),
    ]
    
    print("--- Performance Audit Results ---")
    for item in endpoints:
        if len(item) == 3:
            audit_queries(item[0], item[1], item[2])
        else:
            audit_queries(item[0], item[1])
