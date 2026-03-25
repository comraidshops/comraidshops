from rest_framework import serializers
from .models import User, Vendor, Brand, Category, Product, ProductVariant, Order, OrderItem, Notification, ProductImage, Product360Video, Magazine, Article, Exhibition, Collection, BrandImage, ProductFeature, ProductSpecification, Commission, GlobalCommission, VendorEarning, WithdrawalRequest, VendorNotification, UserAddress, SavedCard, FitFrame, FitItem, SavedFitFrame, HomepageSlide, BrandCommunityMember

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_vendor', 'is_customer']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ExhibitionArticleSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='magazine.title', read_only=True)
    slug = serializers.CharField(source='magazine.slug', read_only=True)
    cover = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'cover']

class ExhibitionProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'slug']

class ExhibitionCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug']

class ExhibitionMagazineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Magazine
        fields = ['id', 'title', 'slug']

class ExhibitionSerializer(serializers.ModelSerializer):
    articles = ExhibitionArticleSerializer(many=True, read_only=True)
    products = ExhibitionProductSerializer(many=True, read_only=True)
    collections = ExhibitionCollectionSerializer(many=True, read_only=True)
    magazines = ExhibitionMagazineSerializer(many=True, read_only=True)

    article_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='articles', queryset=Article.objects.all()
    )
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='products', queryset=Product.objects.all()
    )
    collection_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='collections', queryset=Collection.objects.all()
    )
    magazine_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='magazines', queryset=Magazine.objects.all()
    )

    class Meta:
        model = Exhibition
        fields = [
            'id', 'title', 'slug', 'thumbnail', 'is_featured', 'created_at',
            'description', 'cover_image', 'curator_note', 'is_published',
            'articles', 'products', 'collections', 'magazines',
            'article_ids', 'product_ids', 'collection_ids', 'magazine_ids',
            'meta_title', 'meta_description'
        ]

class BrandImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandImage
        fields = ['id', 'image', 'caption', 'order']

class ProductCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'status', 'slug']

class ProductLiteSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='vendor.brand_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'slug', 'brand_name', 'category_name', 'stock', 'status', 'is_featured']

class ArticleSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='magazine.title', read_only=True)
    products = ProductCardSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, source='products', queryset=Product.objects.all()
    )
    
    class Meta:
        model = Article
        fields = ['id', 'title', 'magazine', 'content', 'image', 'products', 'product_ids', 'created_at', 'updated_at']

class MagazineSerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)
    article_content = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Magazine
        fields = ['id', 'title', 'slug', 'excerpt', 'thumbnail', 'is_featured', 'article', 'article_content', 'created_at', 'meta_title', 'meta_description']
        extra_kwargs = {'slug': {'required': False}}

    def create(self, validated_data):
        article_content = validated_data.pop('article_content', None)
        magazine = Magazine.objects.create(**validated_data)
        if article_content:
            Article.objects.create(magazine=magazine, content=article_content)
        return magazine

    def update(self, instance, validated_data):
        article_content = validated_data.pop('article_content', None)
        instance = super().update(instance, validated_data)
        if article_content:
            article, created = Article.objects.get_or_create(magazine=instance)
            article.content = article_content
            article.save()
        return instance

class CollectionSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ['id', 'name', 'slug', 'season', 'description', 'hero_image', 'products', 'is_featured', 'order', 'meta_title', 'meta_description']

    def get_products(self, obj):
        qs = obj.products.filter(status='approved')
        return ProductCardSerializer(qs, many=True, context=self.context).data

class BrandSerializer(serializers.ModelSerializer):
    vendor_username = serializers.SerializerMethodField()
    vendor_id = serializers.SerializerMethodField()
    
    # These will be provided via annotations in the ViewSet for performance
    approved_product_count = serializers.IntegerField(read_only=True)
    total_product_count = serializers.IntegerField(read_only=True)
    community_count = serializers.IntegerField(read_only=True)
    is_member = serializers.BooleanField(read_only=True)
    
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
            'is_member', 'community_count',
            'meta_title', 'meta_description',
        ]
        extra_kwargs = {'slug': {'required': False}}

    def get_vendor_username(self, obj):
        if hasattr(obj, 'vendor') and obj.vendor and obj.vendor.user:
            return obj.vendor.user.username
        return None

    def get_vendor_id(self, obj):
        if hasattr(obj, 'vendor') and obj.vendor:
            return obj.vendor.id
        return None

    def get_featured_products(self, obj):
        # Even here, we can optimize if we've prefetched featured_products_all
        featured = getattr(obj, 'precomputed_featured_products', None)
        if featured is not None:
            return ProductCardSerializer(featured, many=True, context=self.context).data
            
        if not hasattr(obj, 'vendor') or not obj.vendor:
            return []
        qs = (
            obj.vendor.products
            .filter(status='approved', is_featured=True)
            .order_by('-created_at')
        )
        return ProductCardSerializer(qs, many=True, context=self.context).data

class BrandCommunityMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    joined_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = BrandCommunityMember
        fields = ['id', 'user', 'username', 'brand', 'joined_at']

class VendorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Vendor
        fields = ['id', 'user', 'username', 'brand', 'brand_name', 'commission_rate', 'categories']

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
            'variants', 'images', 'video_360', 'features', 'specifications', 'related_products', 'created_at',
            'meta_title', 'meta_description'
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
        fields = ['id', 'product', 'product_name', 'product_image', 'product_slug', 'brand_name', 'quantity', 'price', 'status']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'total_amount', 'payment_status', 'order_status', 'items', 'created_at',
            'shipping_full_name', 'shipping_phone_number', 'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_zip_code', 'shipping_country'
        ]
        read_only_fields = ['payment_status']

class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    vendor_brand_name = serializers.CharField(source='product.vendor.brand_name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'quantity', 'price', 'status', 'vendor_brand_name']

    def get_product_image(self, obj):
        request = self.context.get('request')
        img = obj.product.images.filter(is_primary=True).first()
        if img and img.image:
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None

class AdminOrderSerializer(serializers.ModelSerializer):
    customer_email = serializers.SerializerMethodField()
    items = AdminOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_email', 'total_amount', 'payment_status', 'order_status', 'items', 'created_at',
            'shipping_full_name', 'shipping_phone_number', 'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_zip_code', 'shipping_country'
        ]
        read_only_fields = ['payment_status']

    def get_customer_email(self, obj):
        if obj.customer:
            return obj.customer.email
        return obj.guest_email

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
            'story', 'editorial_quote', 'materials', 'care_instructions', 'origin_country', 'fit', 
            'weight', 'price', 'stock', 'category', 'collections', 'image', 'status',
            'images', 'video_360', 'brand', 'commission_rate', 'potential_earnings'
        ]

    def get_potential_earnings(self, obj):
        rate = obj.vendor.commission_rate
        return obj.price / (1 + rate)

    def create(self, validated_data):
        # Nested fields are usually popped out
        # But we handle them in the viewSet _handle_media and custom logic
        return super().create(validated_data)

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
        model = GlobalCommission
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
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'status']

class VendorOrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    financials = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'total_amount', 'payment_status', 'order_status', 'items', 'financials', 'created_at',
            'shipping_full_name', 'shipping_phone_number', 'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_zip_code', 'shipping_country'
        ]
        read_only_fields = ['payment_status']

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
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_vendor', 'is_customer', 'is_superuser']
        read_only_fields = ['username', 'is_vendor', 'is_customer', 'is_superuser']

class FitProductSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='vendor.brand.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'slug', 'brand', 'image', 'stock']

class FitItemSerializer(serializers.ModelSerializer):
    product = FitProductSerializer(read_only=True)
    
    class Meta:
        model = FitItem
        fields = ['id', 'label', 'order', 'product']

class FitFrameSerializer(serializers.ModelSerializer):
    items = FitItemSerializer(many=True, read_only=True)
    brand = BrandSerializer(read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, required=False, queryset=Product.objects.all()
    )
    
    class Meta:
        model = FitFrame
        fields = ['id', 'title', 'slug', 'cover_image', 'brand', 'is_mixed', 'is_featured', 'items', 'product_ids']
        extra_kwargs = {'slug': {'required': False}}

    def create(self, validated_data):
        product_ids = validated_data.pop('product_ids', [])
        fit_frame = FitFrame.objects.create(**validated_data)
        for i, product in enumerate(product_ids):
            FitItem.objects.create(fit=fit_frame, product=product, label=product.name, order=i)
        return fit_frame

    def update(self, instance, validated_data):
        product_ids = validated_data.pop('product_ids', None)
        instance = super().update(instance, validated_data)
        if product_ids is not None:
            instance.items.all().delete()
            for i, product in enumerate(product_ids):
                FitItem.objects.create(fit=instance, product=product, label=product.name, order=i)
        return instance

class SavedFitFrameSerializer(serializers.ModelSerializer):
    fitframe = FitFrameSerializer(read_only=True)
    fitframe_id = serializers.PrimaryKeyRelatedField(
        queryset=FitFrame.objects.all(), source='fitframe', write_only=True
    )
    
    class Meta:
        model = SavedFitFrame
        fields = ['id', 'user', 'fitframe', 'fitframe_id', 'created_at']
        read_only_fields = ['user']

class HomepageSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSlide
        fields = ['id', 'image', 'order', 'is_active']
