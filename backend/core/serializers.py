from rest_framework import serializers
from .models import User, Vendor, Brand, Category, Product, ProductVariant, Order, OrderItem, Notification, ProductImage, Product360Video, Magazine, Exhibition, Collection, BrandImage, ProductFeature, ProductSpecification, Commission, VendorEarning, WithdrawalRequest, VendorNotification, UserAddress, SavedCard

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_vendor', 'is_customer']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class MagazineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Magazine
        fields = ['id', 'title', 'slug', 'thumbnail', 'is_featured', 'created_at']

class ExhibitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exhibition
        fields = ['id', 'title', 'slug', 'thumbnail', 'is_featured', 'created_at']

class BrandImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandImage
        fields = ['id', 'image', 'caption', 'order']

class ProductCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'status', 'slug']

class CollectionSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'season', 'description', 'hero_image', 'products', 'is_featured', 'order']

    def get_products(self, obj):
        qs = obj.products.filter(status='approved')
        return ProductCardSerializer(qs, many=True, context=self.context).data

class BrandSerializer(serializers.ModelSerializer):
    vendor_username = serializers.CharField(source='vendor.user.username', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    approved_product_count = serializers.SerializerMethodField()
    total_product_count = serializers.SerializerMethodField()
    featured_products = serializers.SerializerMethodField()
    
    gallery = BrandImageSerializer(many=True, read_only=True)
    collections = CollectionSerializer(many=True, read_only=True)
    editorial_refs = MagazineSerializer(many=True, read_only=True)
    exhibition_refs = ExhibitionSerializer(many=True, read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'tagline', 'hero_image', 'logo',
            'philosophy', 'founder_name', 'founder_bio', 'founder_image',
            'established_year', 'origin_country', 'website', 'social_links', 'awards',
            'manifesto', 'featured_quote', 'story',
            'gallery', 'collections', 'editorial_refs', 'exhibition_refs',
            'is_featured', 'created_at', 'vendor_username', 'vendor_id',
            'approved_product_count', 'total_product_count', 'featured_products',
        ]

    def get_approved_product_count(self, obj):
        if not hasattr(obj, 'vendor'):
            return 0
        return obj.vendor.products.filter(status='approved').count()

    def get_total_product_count(self, obj):
        if not hasattr(obj, 'vendor'):
            return 0
        return obj.vendor.products.count()

    def get_featured_products(self, obj):
        if not hasattr(obj, 'vendor'):
            return []
        qs = (
            obj.vendor.products
            .filter(status='approved', is_featured=True)
            .order_by('-created_at')
        )
        return ProductCardSerializer(qs, many=True, context=self.context).data

class VendorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Vendor
        fields = ['id', 'user', 'username', 'brand_name', 'commission_rate', 'categories']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'stock']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']

class Product360VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product360Video
        fields = ['id', 'video']

class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'title', 'description', 'image', 'order']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value']

class ProductSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.brand_name', read_only=True)
    brand = BrandSerializer(source='vendor.brand', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    video_360 = Product360VideoSerializer(read_only=True)
    related_products = serializers.SerializerMethodField()
    features = ProductFeatureSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'vendor', 'vendor_name', 'brand', 'category', 'category_slug', 'collections', 
            'name', 'description', 'short_description', 'story', 'hero_video', 'editorial_quote', 'materials', 'care_instructions', 
            'origin_country', 'fit', 'weight', 'price', 'stock', 'image', 'is_featured', 'status', 
            'variants', 'images', 'video_360', 'features', 'specifications', 'related_products', 'created_at'
        ]

    def get_related_products(self, obj):
        if not hasattr(obj, 'vendor') or not obj.vendor:
            return []
        
        qs = obj.vendor.products.filter(status='approved').exclude(id=obj.id)[:4]
        return ProductCardSerializer(qs, many=True, context=self.context).data

    def validate_collections(self, collections):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'vendor_profile'):
            return collections
        
        if request.user.is_staff:
            return collections
            
        vendor_brand = request.user.vendor_profile.brand
        for collection in collections:
            if collection.brand != vendor_brand:
                raise serializers.ValidationError(f"Collection '{collection.name}' does not belong to your brand.")
        return collections

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    product_slug = serializers.SlugField(source='product.slug', read_only=True)
    brand_name = serializers.CharField(source='product.vendor.brand_name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'product_slug', 'brand_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'total_amount', 'status', 'items', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'is_read', 'created_at']

class VendorProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    video_360 = Product360VideoSerializer(read_only=True)
    brand = BrandSerializer(source='vendor.brand', read_only=True)

    status = serializers.CharField(read_only=True)
    vendor = serializers.PrimaryKeyRelatedField(read_only=True)
    commission_rate = serializers.DecimalField(source='vendor.commission_rate', max_digits=5, decimal_places=2, read_only=True)
    potential_earnings = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'vendor', 'name', 'short_description', 'description', 
            'story', 'materials', 'care_instructions', 'origin_country', 'fit', 
            'weight', 'price', 'stock', 'category', 'collections', 'image', 'status',
            'images', 'video_360', 'brand', 'commission_rate', 'potential_earnings'
        ]

    def get_potential_earnings(self, obj):
        rate = obj.vendor.commission_rate
        return obj.price / (1 + rate)

    def validate_collections(self, collections):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'vendor_profile'):
            return collections
        
        if request.user.is_staff:
            return collections
            
        vendor_brand = request.user.vendor_profile.brand
        for collection in collections:
            if collection.brand != vendor_brand:
                raise serializers.ValidationError(f"Collection '{collection.name}' does not belong to your brand.")
        return collections

class CommissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commission
        fields = '__all__'

class VendorEarningSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    class Meta:
        model = VendorEarning
        fields = '__all__'

class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = WithdrawalRequest
        fields = '__all__'
        read_only_fields = ['vendor', 'status']

class VendorNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorNotification
        fields = '__all__'

class VendorOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']

class VendorOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    financials = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'total_amount', 'status', 'items', 'financials', 'created_at']

    def get_items(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'vendor_profile'):
            return []
        
        vendor = request.user.vendor_profile
        vendor_items = obj.items.filter(product__vendor=vendor)
        return VendorOrderItemSerializer(vendor_items, many=True).data

    def get_financials(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request.user, 'vendor_profile'):
            return None
        
        vendor = request.user.vendor_profile
        try:
            from .models import VendorEarning
            earning = VendorEarning.objects.get(vendor=vendor, order=obj)
            return {
                "commission": earning.commission_amount,
                "net_earning": earning.net_amount,
                "status": earning.status
            }
        except:
            return None

class VendorBrandSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = [
            'name', 'tagline', 'description', 'philosophy', 'story', 
            'hero_image', 'logo', 'social_links'
        ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_customer=True
        )
        return user

class UserAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAddress
        fields = '__all__'
        read_only_fields = ['user']

class SavedCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedCard
        fields = '__all__'
        read_only_fields = ['user', 'authorization_code']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username']

