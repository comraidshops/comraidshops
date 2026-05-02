import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import RequestFactory
from core.models import Collection, Brand, User
from core.admin_views import AdminCollectionViewSet

# Create dummy data
user = User.objects.create(username='test_admin', is_superuser=True, is_staff=True)
brand = Brand.objects.create(name='Test Brand')
collection = Collection.objects.create(name='Test Collection', brand=brand)

factory = RequestFactory()

# Mock file
from django.core.files.uploadedfile import SimpleUploadedFile
file_content = b"fake image content"
image = SimpleUploadedFile("test_image.jpg", file_content, content_type="image/jpeg")

# Prepare data
data = {
    'gallery_count': '1',
    'gallery_type_0': 'new',
    'gallery_image_0': image,
    'gallery_caption_0': 'Test Caption',
    'gallery_order_0': '0',
}

request = factory.patch(f'/admin-api/collections/{collection.id}/', data=data, format='multipart')
request.user = user

view = AdminCollectionViewSet.as_view({'patch': 'partial_update'})
response = view(request, pk=collection.id)

print(f"Response status: {response.status_code}")
print(f"Gallery count after: {collection.gallery.count()}")
for img in collection.gallery.all():
    print(f"- Image ID: {img.id}, Caption: {img.caption}, File: {img.image.name}")

# Clean up
collection.delete()
brand.delete()
user.delete()
