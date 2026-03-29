from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify

class User(AbstractUser):
    # Additional fields if needed, e.g. roles check
    is_vendor = models.BooleanField(default=False)
    is_vendor_approved = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True) # Default role
    
    def __str__(self):
        return self.username

class Category(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(unique=True, blank=True)
    
    class Meta:
        verbose_name_plural = 'Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Magazine(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.TextField(blank=True, help_text="Short description for the magazine index page")
    thumbnail = models.ImageField(upload_to="editorial/thumbnails/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=255, blank=True, null=True, help_text="SEO override title")
    meta_description = models.TextField(blank=True, null=True, help_text="SEO override description")
    
    # Linked Articles for "Editorial Context"
    linked_articles = models.ManyToManyField('Article', related_name='linked_in_magazines', blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Article(models.Model):
    magazine = models.ForeignKey(Magazine, on_delete=models.SET_NULL, related_name='articles', null=True, blank=True)
    content = models.TextField(blank=True, help_text="Full HTML content of the article")
    image = models.ImageField(upload_to="articles/images/", null=True, blank=True)
    
    # Cinematic Video System
    video_url = models.URLField(max_length=500, null=True, blank=True, help_text="YouTube, Vimeo, or Cloudinary URL")
    video_file = models.FileField(upload_to="articles/videos/", null=True, blank=True, help_text="Direct video upload (will be moved to Cloudinary)")
    video_provider = models.CharField(
        max_length=20, 
        choices=[
            ('youtube', 'YouTube'),
            ('vimeo', 'Vimeo'),
            ('cloudinary', 'Cloudinary')
        ],
        null=True,
        blank=True
    )
    video_thumbnail = models.URLField(max_length=500, null=True, blank=True)

    products = models.ManyToManyField('Product', related_name='featured_in_articles', blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Article for {self.magazine.title}"

class Exhibition(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    thumbnail = models.ImageField(upload_to="editorial/thumbnails/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=255, blank=True, null=True, help_text="SEO override title")
    meta_description = models.TextField(blank=True, null=True, help_text="SEO override description")
    
    # Curation fields
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="editorial/exhibitions/", null=True, blank=True)
    curator_note = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    
    # Relationships
    articles = models.ManyToManyField('Article', related_name="exhibitions", blank=True)
    products = models.ManyToManyField('Product', related_name="exhibitions", blank=True)
    collections = models.ManyToManyField('Collection', related_name="exhibitions", blank=True)
    magazines = models.ManyToManyField('Magazine', related_name="exhibitions", blank=True)

    def __str__(self):
        return self.title

class Brand(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    tagline = models.CharField(max_length=255, blank=True)
    hero_image = models.ImageField(upload_to="brands/heroes/", null=True, blank=True)
    logo = models.ImageField(upload_to="brands/logos/", null=True, blank=True)
    
    # SEO Fields
    meta_title = models.CharField(max_length=255, blank=True, null=True, help_text="SEO override title")
    meta_description = models.TextField(blank=True, null=True, help_text="SEO override description")
    
    # Luxury & Editorial fields
    philosophy = models.TextField(blank=True)
    founder_name = models.CharField(max_length=255, blank=True)
    founder_bio = models.TextField(blank=True)
    founder_image = models.ImageField(upload_to="brands/founders/", null=True, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    origin_country = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    awards = models.TextField(blank=True)
    manifesto = models.TextField(blank=True)
    featured_quote = models.CharField(max_length=400, blank=True)
    story = models.TextField(blank=True)
    
    # Editorial relationships
    editorial_refs = models.ManyToManyField(Magazine, related_name='brands', blank=True)
    exhibition_refs = models.ManyToManyField(Exhibition, related_name='brands', blank=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class BrandImage(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to="brands/gallery/")
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Archive"
        verbose_name_plural = "Archives"

    def __str__(self):
        return f"{self.brand.name} Gallery Image"

class Collection(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    season = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to="collections/heroes/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    # SEO Fields
    meta_title = models.CharField(max_length=255, blank=True, null=True, help_text="SEO override title")
    meta_description = models.TextField(blank=True, null=True, help_text="SEO override description")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.brand.name} - {self.name}"

class Vendor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    brand = models.OneToOneField(Brand, on_delete=models.CASCADE, related_name='vendor', null=True, blank=True)
    brand_name = models.CharField(max_length=100)
    categories = models.ManyToManyField(Category, related_name='vendors')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.10) # 10%
    payout_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    def __str__(self):
        return self.brand_name

class Product(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True)
    story = models.TextField(blank=True)
    hero_video = models.URLField(blank=True)
    editorial_quote = models.CharField(max_length=300, blank=True)
    materials = models.CharField(max_length=300, blank=True)
    care_instructions = models.TextField(blank=True)
    origin_country = models.CharField(max_length=100, blank=True)
    fit = models.CharField(max_length=100, blank=True)
    weight = models.CharField(max_length=50, blank=True)
    price = models.DecimalField(max_digits=15, decimal_places=2, db_index=True)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    collections = models.ManyToManyField(Collection, related_name='products', blank=True)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('pending', 'Pending'),
            ('approved', 'Approved')
        ],
        default='pending',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    # SEO Fields
    meta_title = models.CharField(max_length=255, blank=True, null=True, help_text="SEO override title")
    meta_description = models.TextField(blank=True, null=True, help_text="SEO override description")
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100) # e.g. "Size: M" or "Color: Red"
    stock = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"

class Order(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),        # User initiated checkout
        ('paid', 'Paid'),              # Paystack webhook confirmed payment
        ('confirmed', 'Confirmed'),    # Admin verified and confirmed payment
        ('failed', 'Failed'),          # Payment failed or abandoned
        ('refunded', 'Refunded'),      # Payment reversed
    )
    ORDER_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    guest_email = models.EmailField(blank=True, null=True, db_index=True)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, db_index=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending', db_index=True)
    order_status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Shipping Snapshot
    shipping_full_name = models.CharField(max_length=255, blank=True, null=True)
    shipping_phone_number = models.CharField(max_length=20, blank=True, null=True)
    shipping_address_line1 = models.CharField(max_length=255, blank=True, null=True)
    shipping_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_zip_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, default='Nigeria', blank=True, null=True)
    
    def __str__(self):
        return f"Order #{self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=15, decimal_places=2) # Snapshot of price at purchase
    status = models.CharField(
        max_length=20, 
        choices=Order.ORDER_STATUS_CHOICES, 
        default='pending',
        db_index=True
    )
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        # Optimization: Only hit DB for old_status if not new
        old_status = None
        if not is_new:
            # We use .filter().values('status').first() for a minimal query
            old_status_dict = OrderItem.objects.filter(pk=self.pk).values('status').first()
            old_status = old_status_dict['status'] if old_status_dict else None
            
        super().save(*args, **kwargs)
        
        # If status changed, recalculate order status
        if is_new or old_status != self.status:
            self.update_order_status()

    def update_order_status(self):
        order = self.order
        items = order.items.all()
        statuses = [item.status for item in items]
        
        if not statuses:
            return

        # Logic: 
        # 1. If all are 'delivered', order is 'delivered'
        # 2. If all are 'cancelled', order is 'cancelled'
        # 3. If any is 'shipped' (and others are delivered/shipped), order is 'shipped'
        # 4. If any is 'processing', order is 'processing'
        # 5. Otherwise 'pending'
        
        if all(s == 'delivered' for s in statuses):
            new_status = 'delivered'
        elif all(s == 'cancelled' for s in statuses):
            new_status = 'cancelled'
        elif any(s == 'shipped' for s in statuses) and all(s in ['shipped', 'delivered', 'cancelled'] for s in statuses):
            new_status = 'shipped'
        elif any(s == 'processing' for s in statuses):
            new_status = 'processing'
        elif any(s == 'shipped' for s in statuses):
             new_status = 'shipped'
        else:
            new_status = 'pending'
            
        if order.order_status != new_status:
            order.order_status = new_status
            order.save(update_fields=['order_status', 'updated_at'])

    def __str__(self):
        return f"{self.quantity} x {self.product.name} ({self.status})"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/additional/')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} Image"

class Product360Video(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='video_360')
    video = models.FileField(upload_to='products/360/')

    def __str__(self):
        return f"{self.product.name} 360 Video"
class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="features")
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="product_features/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.product.name} - {self.title}"

class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="specifications")
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.product.name} / {self.name}"

class GlobalCommission(models.Model):
    rate = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Global Commission {self.rate}%"

class Commission(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='commissions')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='commissions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commission for {self.vendor.brand_name} - Order {self.order.id}"

class VendorEarning(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('cleared', 'Cleared'),
    )
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='earnings')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='vendor_earnings')
    gross_amount = models.DecimalField(max_digits=15, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=15, decimal_places=2)
    net_amount = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Earning for {self.vendor.brand_name} - Order {self.order.id}"

class WithdrawalRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    )
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    account_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Withdrawal - {self.vendor.brand_name} - ${self.amount}"

class VendorNotification(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='vendor_notifications')
    message = models.TextField()
    type = models.CharField(max_length=50)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.vendor.brand_name}: {self.type}"

class UserAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Nigeria')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.address_line1}"

    class Meta:
        verbose_name_plural = "User Addresses"

class SavedCard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_cards')
    authorization_code = models.CharField(max_length=255) # Paystack token
    last4 = models.CharField(max_length=4)
    exp_month = models.CharField(max_length=2)
    exp_year = models.CharField(max_length=4)
    card_type = models.CharField(max_length=50) # e.g. visa, mastercard
    bank = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.card_type} **** {self.last4}"

class FitFrame(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    cover_image = models.ImageField(upload_to="fitframes/covers/")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_fits")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="fit_frames")
    is_mixed = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class FitItem(models.Model):
    fit = models.ForeignKey(FitFrame, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="fit_items")
    label = models.CharField(max_length=100)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.label} in {self.fit.title}"

class SavedFitFrame(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_fits')
    fitframe = models.ForeignKey(FitFrame, on_delete=models.CASCADE, related_name='saved_by_users')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'fitframe')


class HomepageSlide(models.Model):
    image = models.ImageField(upload_to='homepage/slides/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Slide {self.order} - {'Active' if self.is_active else 'Inactive'}"

class BrandCommunityMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='joined_communities')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='community_members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'brand')
        verbose_name = "Community Member"
        verbose_name_plural = "Community Members"

    def __str__(self):
        return f"{self.user.username} - {self.brand.name}"
