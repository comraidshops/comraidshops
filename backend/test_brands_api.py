import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['DB_NAME'] = '' # Force sqlite fallback
import django
django.setup()

from core.models import Brand
from core.serializers import BrandSerializer
from rest_framework.request import Request
from django.test import RequestFactory

brand = Brand(name="Test Brand", slug="test-brand")

factory = RequestFactory()
request = factory.get('/')
request.user = django.contrib.auth.models.AnonymousUser()

try:
    data = BrandSerializer(brand, context={'request': Request(request)}).data
    print("SUCCESS: Brand serialized without a vendor!")
except Exception as e:
    import traceback
    traceback.print_exc()
    print("FAILED")
    sys.exit(1)
