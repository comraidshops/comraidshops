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
    name = models.CharField(max_length=100)
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
    thumbnail = models.ImageField(upload_to="editorial/thumbnails/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Exhibition(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    thumbnail = models.ImageField(upload_to="editorial/thumbnails/", null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Brand(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    tagline = models.CharField(max_length=255, blank=True)
    hero_image = models.ImageField(upload_to="brands/heroes/", null=True, blank=True)
    logo = models.ImageField(upload_to="brands/logos/", null=True, blank=True)
    
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
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

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
    payout_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
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
    price = models.DecimalField(max_digits=10, decimal_places=2)
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
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
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
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('shipped', 'Shipped'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Snapshot of price at purchase
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

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

class Commission(models.Model):
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='commissions')
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='commissions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
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
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

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
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bank_name = models.CharField(max_length=100)
    account_number = models.CharField(max_length=50)
    account_name = models.CharField(max_length=100)
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
