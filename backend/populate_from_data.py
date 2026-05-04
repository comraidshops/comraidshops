import os
import django
import json
from decimal import Decimal
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import (
    User, Brand, Category, Vendor, Magazine, BrandImage
)

def populate_from_json():
    print("Starting data population from data/all_data.json...")
    
    # Try current directory first, then parent directory
    data_path = os.path.join(os.getcwd(), 'data', 'all_data.json')
    if not os.path.exists(data_path):
        data_path = os.path.join(os.path.dirname(os.getcwd()), 'data', 'all_data.json')
        
    if not os.path.exists(data_path):
        print(f"Error: Could not find 'data/all_data.json' in {os.getcwd()} or its parent.")
        return

    def clean_image_url(url):
        if not url:
            return ''
        # Cloudinary URLs can exceed the 100 char limit of Django ImageFields.
        # We extract just the relative path (e.g., 'media/...') which is what CloudinaryStorage expects anyway.
        if 'image/upload/' in url:
            path = url.split('image/upload/')[1]
            import re
            return re.sub(r'^v\d+/', '', path)
        return url[:100]

    with open(data_path, 'r') as f:
        data = json.load(f)

    # 1. Magazines
    mag_objs = []
    for mag_data in data.get('magazines', []):
        slug = slugify(mag_data['title'])
        raw_thumbnail = mag_data['images'][0] if mag_data['images'] else ''
        thumbnail = clean_image_url(raw_thumbnail)
        mag, created = Magazine.objects.update_or_create(
            slug=slug,
            defaults={
                'title': mag_data['title'],
                'description': mag_data['content'],
                'thumbnail': thumbnail,
                'is_featured': True
            }
        )
        mag_objs.append(mag)
        print(f"{'Created' if created else 'Updated'} Magazine: {mag.title}")

    # 2. Categories (Ensuring at least one exists)
    default_cat, _ = Category.objects.get_or_create(name='Uncategorized')

    # 3. Brands & Vendors
    for brand_data in data.get('brands', []):
        slug = brand_data.get('slug') or slugify(brand_data['name'])
        raw_hero_image = brand_data['images'][0] if brand_data['images'] else ''
        hero_image = clean_image_url(raw_hero_image)
        
        brand, created = Brand.objects.update_or_create(
            slug=slug,
            defaults={
                'name': brand_data['name'],
                'description': brand_data['description'],
                'hero_image': hero_image,
                'established_year': 2024,
                'origin_country': 'Nigeria', # Defaulting based on Mezaiq description
                'is_featured': True
            }
        )
        print(f"{'Created' if created else 'Updated'} Brand: {brand.name}")
        
        # Link magazines
        if mag_objs:
            brand.editorial_refs.set(mag_objs)

        # Gallery
        for idx, img_url in enumerate(brand_data.get('images', [])):
            clean_url = clean_image_url(img_url)
            BrandImage.objects.get_or_create(
                brand=brand,
                image=clean_url,
                defaults={'caption': f"{brand.name} Perspective {idx + 1}", 'order': idx}
            )

        # Vendor handling
        user_slug = brand.slug.replace('-', '_')
        username = f"vendor_{user_slug}"
        user, u_created = User.objects.get_or_create(
            username=username,
            defaults={'email': f"contact@{brand.slug}.com", 'is_vendor': True, 'is_vendor_approved': True}
        )
        if u_created:
            user.set_password('luxury123')
            user.save()
            print(f"Created User: {username}")

        vendor, v_created = Vendor.objects.get_or_create(
            user=user,
            defaults={
                'brand': brand,
                'brand_name': brand.name,
                'commission_rate': Decimal('0.10')
            }
        )
        if not v_created:
            vendor.brand = brand
            vendor.brand_name = brand.name
            vendor.save()
        
        print(f"{'Created' if v_created else 'Updated'} Vendor for {brand.name}")

    print("Population from JSON complete.")

if __name__ == "__main__":
    populate_from_json()
