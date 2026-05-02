import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# We don't need full django setup for testing multipart parser
from django.core.handlers.wsgi import WSGIRequest
from rest_framework.parsers import MultiPartParser
import io

boundary = b'------------------------boundary123'
body = (
    b'--------------------------boundary123\r\n'
    b'Content-Disposition: form-data; name="gallery_count"\r\n\r\n'
    b'1\r\n'
    b'--------------------------boundary123\r\n'
    b'Content-Disposition: form-data; name="gallery_type_0"\r\n\r\n'
    b'new\r\n'
    b'--------------------------boundary123\r\n'
    b'Content-Disposition: form-data; name="gallery_image_0"; filename="test.png"\r\n'
    b'Content-Type: image/png\r\n\r\n'
    b'fake_image_content\r\n'
    b'--------------------------boundary123--\r\n'
)

class MockRequest:
    def __init__(self, body, boundary):
        self.META = {
            'CONTENT_TYPE': f'multipart/form-data; boundary={boundary.decode()}',
            'CONTENT_LENGTH': len(body)
        }
        self.stream = io.BytesIO(body)
        self.upload_handlers = []

parser = MultiPartParser()
data, files = parser.parse(MockRequest(body, boundary))
print(f"Data: {data}")
print(f"Files: {files}")
