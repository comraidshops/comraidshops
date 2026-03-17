import os
import django
from django.utils.text import slugify
from decimal import Decimal
import json

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import (
    User, Brand, Category, Vendor, Product, ProductVariant, 
    Collection, Magazine, Exhibition, BrandImage, ProductImage,
    ProductFeature, ProductSpecification, Notification
)

def populate():
    print("Starting luxury data population...")

    # 1. Categories
    categories_data = ['Outerwear', 'Tops', 'Bottoms', 'Accessories', 'Objects']
    categories = {}
    for name in categories_data:
        cat, _ = Category.objects.get_or_create(name=name)
        categories[name] = cat

    # 2. Magazines (Editorial References)
    mags = [
        ('The Working Body', 'the-working-body', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
        ('Discipline as Form', 'discipline-as-form', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
        ('Art of Suffering', 'art-of-suffering', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
        ('Emptiness of Hype', 'emptiness-of-hype', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
    ]
    mag_objs = []
    for title, slug, thumb in mags:
        m, _ = Magazine.objects.get_or_create(slug=slug, defaults={'title': title, 'thumbnail': thumb})
        mag_objs.append(m)

    # 3. Exhibitions
    exhibs = [
        ('The Silent Gallery', 'the-silent-gallery', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
        ('Kinetic Void', 'kinetic-void', 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40'),
    ]
    exhib_objs = []
    for title, slug, thumb in exhibs:
        e, _ = Exhibition.objects.get_or_create(slug=slug, defaults={'title': title, 'thumbnail': thumb})
        exhib_objs.append(e)

    # 4. Brands & Vendors
    brands_data = [
        {
            'name': 'VA Verified Anonymous',
            'slug': 'va-verified-anonymous',
            'description': 'A post-luxury experiment in technical anonymity.',
            'hero_image': 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40',
            'philosophy': 'Identity is a weight. True luxury is the removal of the self from the object.',
            'founder_name': 'The Collective',
            'founder_bio': 'Formed in Berlin as a reaction to high-fashion maximalism.',
            'founder_image': 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40',
            'established_year': 2024,
            'origin_country': 'Germany',
            'website': 'https://va-anon.com',
            'social_links': {'instagram': '@va_anon', 'twitter': '@va_anon'},
            'awards': 'A/F Experimental Design Award 2025',
            'collections': [
                {'name': 'Atelier Drop 01', 'slug': 'atelier-drop-01', 'season': 'Winter 2025', 'description': 'Focus on heavyweight wool and technical membranes.'},
                {'name': 'Runway Capsule', 'slug': 'runway-capsule', 'season': 'SS26', 'description': 'The transparency of motion.'},
            ]
        },
        {
            'name': 'Dore era',
            'slug': 'dore-era',
            'description': 'Understated luxury with a focus on Italian craftsmanship and technical silk.',
            'hero_image': 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40',
            'philosophy': 'The garment is a dialogue between tradition and performance.',
            'founder_name': 'Luca Dore',
            'founder_bio': 'Master tailor with 30 years of experience in Milanese workshops.',
            'founder_image': 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/brands/heroes/Screenshot_2026-03-07_at_21.04.16_cqkn40',
            'established_year': 2020,
            'origin_country': 'Italy',
            'website': 'https://dore-era.it',
            'social_links': {'instagram': '@dore_era'},
            'awards': 'Milan Innovation Prize 2024',
            'collections': [
                {'name': 'Silk Series', 'slug': 'silk-series', 'season': 'Permanent', 'description': 'Our core technical silk essentials.'},
                {'name': 'Winter Essentials', 'slug': 'winter-essentials', 'season': 'FW25', 'description': 'Merino and cashmere blends for the modern nomad.'},
            ]
        }
    ]

    for b_data in brands_data:
        brand, _ = Brand.objects.update_or_create(
            slug=b_data['slug'],
            defaults={
                'name': b_data['name'],
                'description': b_data['description'],
                'hero_image': b_data['hero_image'],
                'philosophy': b_data['philosophy'],
                'founder_name': b_data['founder_name'],
                'founder_bio': b_data['founder_bio'],
                'founder_image': b_data['founder_image'],
                'established_year': b_data['established_year'],
                'origin_country': b_data['origin_country'],
                'website': b_data['website'],
                'social_links': b_data['social_links'],
                'awards': b_data['awards'],
            }
        )
        brand.editorial_refs.set(mag_objs[:2])
        brand.exhibition_refs.set(exhib_objs[:1])

        # Gallery
        for i in range(1, 4):
            BrandImage.objects.get_or_create(
                brand=brand,
                caption=f"{brand.name} Editorial Perspective {i}",
                order=i,
                defaults={'image': brand.hero_image}
            )

        # Collections
        col_objs = []
        for c_data in b_data['collections']:
            col, _ = Collection.objects.update_or_create(
                slug=c_data['slug'],
                defaults={
                    'brand': brand,
                    'name': c_data['name'],
                    'season': c_data['season'],
                    'description': c_data['description'],
                    'hero_image': brand.hero_image,
                    'is_featured': True
                }
            )
            col_objs.append(col)

        # Vendor & User handling
        vendor = getattr(brand, 'vendor', None)
        if vendor:
            user = vendor.user
            print(f"Using existing vendor {user.username} for brand {brand.name}")
        else:
            user_slug = brand.slug.replace('-', '_')
            username = f"vendor_{user_slug}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': f"contact@{brand.slug}.com", 'is_vendor': True, 'is_vendor_approved': True}
            )
            if created:
                user.set_password('luxury123')
                user.save()
            
            vendor, _ = Vendor.objects.get_or_create(
                user=user,
                defaults={
                    'brand': brand,
                    'brand_name': brand.name,
                    'commission_rate': Decimal('0.15'),
                    'payout_balance': Decimal('12500.00')
                }
            )
        
        # Update Vendor fields regardless
        vendor.brand_name = brand.name
        vendor.brand = brand
        vendor.save()
        vendor.categories.add(*categories.values())

        # 5. Products (5 per brand)
        for i in range(1, 6):
            p_name = f"{brand.name} Object {i:02d}"
            p_slug = slugify(p_name)
            product, _ = Product.objects.update_or_create(
                slug=p_slug,
                defaults={
                    'vendor': vendor,
                    'category': categories['Tops'] if i%2==0 else categories['Bottoms'],
                    'name': p_name,
                    'description': f"An editorial masterpiece from the {brand.name} archive. Focuses on the intersection of form and void.",
                    'short_description': f"Limited edition {brand.name} garment.",
                    'story': "Every stitch tells a story of reduction. We removed everything that wasn't essential. What remains is the garment's soul.",
                    'materials': "80% Tech Silk, 20% Recycled Polyamide.",
                    'care_instructions': "Dry clean only. Store in a temperature-controlled environment.",
                    'origin_country': brand.origin_country,
                    'fit': "Relaxed architectural fit.",
                    'weight': "120g",
                    'price': Decimal(str(250 + (i * 100))),
                    'stock': 10 + i,
                    'image': 'https://res.cloudinary.com/dormpccho/image/upload/v1/media/products/IMG_4314_2_e8qqyj',
                    'is_featured': i == 1,
                    'status': 'approved'
                }
            )
            product.collections.add(col_objs[0])

            # Variants
            for size in ['S', 'M', 'L']:
                ProductVariant.objects.get_or_create(product=product, name=f"Size: {size}", defaults={'stock': 5})

            # Features
            for f_idx in range(1, 3):
                ProductFeature.objects.get_or_create(
                    product=product,
                    title=f"Architectural Detail {f_idx}",
                    defaults={
                        'description': f"Focusing on the {['asymmetric seam', 'tactile texture'][f_idx-1]} of the piece.",
                        'image': product.image,
                        'order': f_idx
                    }
                )

            # Specs
            specs = [('Gauge', '12gg'), ('Fabric Density', '200gsm'), ('Water Resistance', 'DWR Treated')]
            for s_name, s_val in specs:
                ProductSpecification.objects.get_or_create(product=product, name=s_name, value=s_val)

            # Additional Images
            for img_idx in range(1, 3):
                ProductImage.objects.get_or_create(
                    product=product,
                    order=img_idx,
                    defaults={'image': product.image, 'is_primary': False}
                )

    # 6. Notifications
    admin_user = User.objects.filter(is_superuser=True).first()
    if admin_user:
        Notification.objects.create(
            user=admin_user,
            title="System Upgrade Complete",
            body="The editorial luxury update has been successfully deployed across all brand channels.",
            is_read=False
        )

    print("Population complete.")

if __name__ == "__main__":
    populate()
