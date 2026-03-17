from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Brand, Vendor, Category, Product

User = get_user_model()

class BrandAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create Category
        self.category = Category.objects.create(name='Shirts', slug='shirts')
        
        # Create Brand 1
        self.brand1 = Brand.objects.create(name='Alpha Brand', slug='alpha-brand', description='Alpha desc')
        self.user1 = User.objects.create_user(username='vendor1', password='password', is_vendor=True, is_vendor_approved=True)
        self.vendor1 = Vendor.objects.create(user=self.user1, brand=self.brand1, brand_name='Alpha Brand')
        
        # Create Brand 2
        self.brand2 = Brand.objects.create(name='Beta Brand', slug='beta-brand', description='Beta desc')
        self.user2 = User.objects.create_user(username='vendor2', password='password', is_vendor=True, is_vendor_approved=True)
        self.vendor2 = Vendor.objects.create(user=self.user2, brand=self.brand2, brand_name='Beta Brand')
        
        # Create Products
        self.product1 = Product.objects.create(
            vendor=self.vendor1, category=self.category, name='Alpha Shirt', description='Nice', price='19.99', stock=10, status='approved'
        )
        self.product2 = Product.objects.create(
            vendor=self.vendor1, category=self.category, name='Alpha Pants', description='Cool', price='29.99', stock=5, status='approved'
        )
        self.product3 = Product.objects.create(
            vendor=self.vendor2, category=self.category, name='Beta Hat', description='Wow', price='9.99', stock=20, status='approved'
        )

    def test_brand_list(self):
        url = '/api/brands/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Check that nested vendor data is present
        self.assertIn('vendor_username', response.data[0])
        
    def test_brand_retrieve(self):
        url = f'/api/brands/{self.brand1.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Alpha Brand')
        self.assertEqual(response.data['vendor_username'], 'vendor1')

    def test_brand_products_list(self):
        url = f'/api/brands/{self.brand1.slug}/products/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # DRF pagination might return {'count': X, 'results': []} or just []
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 2)
        
        names = [p['name'] for p in results]
        self.assertIn('Alpha Shirt', names)
        self.assertIn('Alpha Pants', names)
        self.assertNotIn('Beta Hat', names)

    def test_product_includes_brand_info(self):
        url = '/api/products/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 3)
        
        # Pick one alpha product
        alpha_prod = next(p for p in results if p['name'] == 'Alpha Shirt')
        self.assertIn('brand', alpha_prod)
        self.assertIsNotNone(alpha_prod['brand'])
        self.assertEqual(alpha_prod['brand']['name'], 'Alpha Brand')

    def test_brand_collections_ordering_and_featured(self):
        from .models import Collection
        # Create Collections for Alpha Brand with specific ordering
        c1 = Collection.objects.create(brand=self.brand1, name="Winter", slug="winter", order=2, is_featured=True)
        c2 = Collection.objects.create(brand=self.brand1, name="Summer", slug="summer", order=1, is_featured=False)
        
        # Test Brand Retrieve endpoint includes collections in correct order
        url = f'/api/brands/{self.brand1.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        collections = response.data.get('collections', [])
        self.assertEqual(len(collections), 2)
        
        # Verify ordering (Summer should be first due to order=1)
        self.assertEqual(collections[0]['name'], 'Summer')
        self.assertEqual(collections[0]['order'], 1)
        self.assertFalse(collections[0]['is_featured'])
        
        self.assertEqual(collections[1]['name'], 'Winter')
        self.assertEqual(collections[1]['order'], 2)
        self.assertTrue(collections[1]['is_featured'])
