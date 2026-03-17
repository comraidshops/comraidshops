from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Vendor, Product, Category

User = get_user_model()

class VendorProductCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Test Category', slug='test-category')
        
        # Test users
        self.user = User.objects.create_user(username='user', password='password')
        
        self.vendor_user = User.objects.create_user(username='vendor', password='password', is_vendor=True)
        self.vendor = Vendor.objects.create(user=self.vendor_user, brand_name='Test Brand')
        
        self.approved_vendor_user = User.objects.create_user(username='approved_vendor', password='password', is_vendor=True, is_vendor_approved=True)
        self.approved_vendor = Vendor.objects.create(user=self.approved_vendor_user, brand_name='Approved Brand')
        
        self.url = reverse('vendor-product-create')

    def test_anonymous_create_product(self):
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_non_vendor_create_product(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unapproved_vendor_create_product(self):
        self.client.force_authenticate(user=self.vendor_user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approved_vendor_create_product(self):
        self.client.force_authenticate(user=self.approved_vendor_user)
        data = {
            'name': 'New Product',
            'description': 'Description',
            'price': '10.00',
            'stock': 100,
            'category': self.category.id
        }
        
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        product = Product.objects.first()
        self.assertEqual(product.vendor, self.approved_vendor)
        self.assertEqual(product.name, 'New Product')
