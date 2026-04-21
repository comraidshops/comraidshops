from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Brand

User = get_user_model()

class AdminBrandViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(username='admin', password='password', email='admin@example.com')
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_create_brand_success(self):
        """
        Tests that a brand can be created via the admin API and the response 
        includes the safe defaults for annotation-backed fields.
        """
        url = '/admin-api/brands/'
        payload = {
            'name': 'New Audit Brand',
            'description': 'A description for the new brand.',
            'tagline': 'Crafting excellence',
            'philosophy': 'Quality first.'
        }
        
        response = self.client.post(url, payload)
        
        # Verify status code is 201 Created (not 500 error!)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify brand exists in DB
        brand = Brand.objects.get(name='New Audit Brand')
        self.assertEqual(brand.tagline, 'Crafting excellence')
        
        # Verify that annotated fields default to safe values in the response
        self.assertEqual(response.data['approved_product_count'], 0)
        self.assertEqual(response.data['total_product_count'], 0)
        self.assertEqual(response.data['community_count'], 0)
        self.assertFalse(response.data['is_member'])
