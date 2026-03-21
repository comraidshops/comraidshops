import os
import django
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Article

# Get the path to the hardcoded image in the frontend
image_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'public', 'new_image', 'art_of_suffering.jpg')

if os.path.exists(image_path):
    print(f"Found image at {image_path}")
    articles = Article.objects.all()
    for article in articles:
        if not article.image:
            with open(image_path, 'rb') as f:
                # Save the file to the image field which will upload it to cloudinary
                article.image.save('art_of_suffering.jpg', File(f), save=True)
            print(f"Updated article ID {article.id}")
else:
    print(f"Image not found at {image_path}")
