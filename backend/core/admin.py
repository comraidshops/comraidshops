from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Category, Brand, Vendor, Product, ProductVariant, Order, OrderItem, Notification, ProductImage, Product360Video, Magazine, Exhibition, Collection, BrandImage, ProductFeature, ProductSpecification

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = BaseUserAdmin.list_display + ('is_vendor', 'is_vendor_approved', 'is_customer')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Roles', {'fields': ('is_vendor', 'is_vendor_approved', 'is_customer')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Roles', {'fields': ('is_vendor', 'is_vendor_approved', 'is_customer')}),
    )

@admin.register(Magazine)
class MagazineAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_featured', 'created_at')
    list_filter = ('is_featured',)
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Exhibition)
class ExhibitionAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_featured', 'created_at')
    list_filter = ('is_featured',)
    prepopulated_fields = {'slug': ('title',)}

class BrandImageInline(admin.TabularInline):
    model = BrandImage
    extra = 1
    verbose_name = "Archive"
    verbose_name_plural = "Archives"

class CollectionInline(admin.TabularInline):
    model = Collection
    extra = 1
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_featured', 'established_year', 'origin_country', 'created_at')
    list_filter = ('is_featured', 'origin_country')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'philosophy', 'founder_name')
    inlines = [BrandImageInline, CollectionInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'hero_image', 'is_featured')
        }),
        ('Luxury & Positioning', {
            'fields': ('philosophy', 'established_year', 'origin_country', 'website', 'social_links', 'awards')
        }),
        ('Founder Info', {
            'fields': ('founder_name', 'founder_bio', 'founder_image')
        }),
        ('Editorial', {
            'fields': ('editorial_refs', 'exhibition_refs')
        }),
    )

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('brand_name', 'user', 'commission_rate', 'payout_balance')
    list_filter = ('commission_rate',)
    search_fields = ('brand_name', 'user__username')

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class Product360VideoInline(admin.TabularInline):
    model = Product360Video
    extra = 1

class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1

class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1

@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'is_featured', 'order', 'created_at')
    list_filter = ('brand', 'is_featured')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'brand__name')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'vendor', 'category', 'price', 'stock', 'is_featured', 'created_at')
    list_filter = ('category', 'vendor__brand', 'is_featured', 'collections', 'created_at')
    search_fields = ('name', 'description', 'vendor__brand_name')
    inlines = [ProductImageInline, Product360VideoInline, ProductVariantInline, ProductFeatureInline, ProductSpecificationInline]

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'stock')
    search_fields = ('product__name', 'name')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('customer__username', 'id')
    inlines = [OrderItemInline]
    readonly_fields = ('total_amount',)

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price')
    list_filter = ('order__created_at',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__username', 'title', 'body')

@admin.register(BrandImage)
class ArchivesAdmin(admin.ModelAdmin):
    list_display = ('brand', 'caption', 'order')
    list_filter = ('brand',)
    search_fields = ('brand__name', 'caption')
