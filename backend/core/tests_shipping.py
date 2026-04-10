from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Category, Vendor, Product, Brand

class ShippingValidationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='password', email='test@example.com')
        self.category = Category.objects.create(name='Test Category')
        self.brand = Brand.objects.create(name='Test Brand')
        self.vendor = Vendor.objects.create(user=self.user, brand=self.brand, brand_name='Test Brand')
        self.product = Product.objects.create(
            vendor=self.vendor,
            category=self.category,
            name='Test Product',
            price=100.00,
            stock=10
        )
        self.url = reverse('paystack-initialize')
        if not self.url.endswith('/'):
            self.url += '/'

    def test_guest_checkout_missing_shipping_details(self):
        """Test that guest checkout fails if mandatory shipping details are missing."""
        data = {
            'items': [{'id': self.product.id, 'quantity': 1}],
            'guest_email': 'guest@example.com',
            # missing shipping fields
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Missing required shipping information', response.data['error'])

    def test_logged_in_checkout_missing_address_id_and_details(self):
        """Test that logged-in checkout fails if neither address_id nor manual details are provided."""
        self.client.force_authenticate(user=self.user)
        data = {
            'items': [{'id': self.product.id, 'quantity': 1}],
            # missing address_id and manual shipping fields
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Missing required shipping information', response.data['error'])

    def test_guest_checkout_valid_shipping_details(self):
        """Test that guest checkout succeeds (reaches Paystack init) if valid shipping details are provided."""
        # We expect a 400 here eventually because of Paystack keys being placeholders, 
        # but the validation step should pass.
        data = {
            'items': [{'id': self.product.id, 'quantity': 1}],
            'guest_email': 'guest@example.com',
            'shipping_full_name': 'Guest Name',
            'shipping_phone_number': '1234567890',
            'shipping_address_line1': '123 Street',
            'shipping_city': 'Lagos',
            'shipping_state': 'Lagos',
            'redirect_url': 'http://localhost:3000/callback'
        }
        response = self.client.post(self.url, data, format='json')
        # If it passes validation, it will try to hit Paystack and fail with placeholder keys (400)
        # but with a DIFFERENT error message than our validation error.
        self.assertNotEqual(response.status_code, status.HTTP_400_BAD_REQUEST if 'Missing required shipping' in str(response.data) else 999)
        if response.status_code == 400:
             self.assertNotIn('Missing required shipping information', response.data.get('error', ''))
