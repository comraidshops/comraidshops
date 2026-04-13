from rest_framework import viewsets, permissions, generics, status
from django.db.models import Q, Count, Exists, OuterRef, Prefetch
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import requests
import json
import hashlib
import hmac
from django.conf import settings
from decouple import config
from .permissions import IsApprovedVendor, IsVendorUser
from .models import User, Vendor, Brand, Category, Product, Order, OrderItem, Notification, ProductImage, Product360Video, Collection, Magazine, Exhibition, VendorEarning, WithdrawalRequest, VendorNotification, UserAddress, SavedCard, FitFrame, FitItem, SavedFitFrame, HomepageSlide, BrandCommunityMember
from .serializers import (
    UserSerializer, VendorSerializer, BrandSerializer, CategorySerializer, 
    ProductSerializer, OrderSerializer, NotificationSerializer,
    VendorProductSerializer, CollectionSerializer, MagazineSerializer, ExhibitionSerializer,
    VendorOrderSerializer, VendorEarningSerializer, WithdrawalRequestSerializer, 
    VendorNotificationSerializer, VendorBrandSettingsSerializer,
    UserRegistrationSerializer, UserAddressSerializer, SavedCardSerializer, UserProfileSerializer,
    FitFrameSerializer, SavedFitFrameSerializer, HomepageSlideSerializer, BrandCommunityMemberSerializer,
    ProductLiteSerializer
)
from django.views.decorators.cache import cache_page
from django.db.models import Prefetch



class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        self.queryset = Collection.objects.prefetch_related('products').all()
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        self.queryset = Collection.objects.prefetch_related('products').all()
        return super().retrieve(request, *args, **kwargs)

class MagazineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Magazine.objects.prefetch_related('articles__products', 'linked_articles__magazine').all()
    def get_queryset(self):
        qs = Magazine.objects.prefetch_related('articles__products', 'linked_articles__magazine').all()
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs
    serializer_class = MagazineSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    # No cache on list — admin featured toggles must be reflected immediately
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class MagazineFeaturedView(APIView):
    """
    Returns the single most-recently featured magazine for the homepage.
    This endpoint is uncached so admin featured toggles appear immediately.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        magazine = Magazine.objects.filter(is_featured=True).prefetch_related('articles__products', 'linked_articles__magazine').order_by('-created_at').first()
        
        # Fallback: If no magazine is marked as featured, return the single most recent magazine.
        # This prevents the homepage section from disappearing when the admin hasn't set a featured flag.
        if not magazine:
            magazine = Magazine.objects.prefetch_related('articles__products', 'linked_articles__magazine').order_by('-created_at').first()

        if not magazine:
            return Response(None)
        from .serializers import MagazineSerializer
        return Response(MagazineSerializer(magazine).data)

from .models import Article
class ArticleLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            article = Article.objects.get(slug=slug)
        except Article.DoesNotExist:
            return Response({"error": "Article not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if article.likes.filter(id=request.user.id).exists():
            article.likes.remove(request.user)
            liked = False
        else:
            article.likes.add(request.user)
            liked = True
            
        return Response({
            "is_liked": liked,
            "likes_count": article.likes.count()
        }, status=status.HTTP_200_OK)

class ExhibitionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exhibition.objects.all()
    def get_queryset(self):
        qs = Exhibition.objects.prefetch_related(
            'articles__magazine', 'products', 'collections', 'magazines'
        ).all()
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs
    serializer_class = ExhibitionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 15))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 60))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        qs = Brand.objects.select_related('vendor__user').prefetch_related(
            'gallery',
            Prefetch(
                'collections', 
                queryset=Collection.objects.prefetch_related(
                    Prefetch('products', queryset=Product.objects.filter(status='approved'))
                )
            ),
            Prefetch(
                'vendor__products',
                queryset=Product.objects.filter(status='approved', is_featured=True).order_by('-created_at'),
                to_attr='precomputed_featured_products'
            ),
            'editorial_refs__article', 
            'exhibition_refs'
        )
        
        # Annotations for high-frequency queries
        qs = qs.annotate(
            community_count=Count('community_members', distinct=True),
            total_product_count=Count('vendor__products', distinct=True),
            approved_product_count=Count(
                'vendor__products', 
                filter=Q(vendor__products__status='approved'),
                distinct=True
            )
        )
        
        if user.is_authenticated:
            qs = qs.annotate(
                is_member=Exists(
                    BrandCommunityMember.objects.filter(brand=OuterRef('pk'), user=user)
                )
            )
        else:
            from django.db.models import Value, BooleanField
            qs = qs.annotate(is_member=Value(False, output_field=BooleanField()))

        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
            
        return qs

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    @method_decorator(cache_page(60 * 5))
    def products(self, request, slug=None):
        brand = self.get_object()
        if not hasattr(brand, 'vendor'):
            return Response([])

        base_qs = brand.vendor.products.select_related('vendor__brand')

        if request.user.is_staff:
            products = base_qs
        elif (
            request.user.is_authenticated
            and hasattr(request.user, 'vendor_profile')
            and brand.vendor.user == request.user
        ):
            products = base_qs
        else:
            products = base_qs.filter(status='approved')

        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, slug=None):
        brand = self.get_object()
        member, created = BrandCommunityMember.objects.get_or_create(user=request.user, brand=brand)
        if created:
            # Maybe add a notification for the vendor later
            return Response({"detail": "Joined community successfully."}, status=status.HTTP_201_CREATED)
        return Response({"detail": "Already a member."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def leave(self, request, slug=None):
        brand = self.get_object()
        deleted, _ = BrandCommunityMember.objects.filter(user=request.user, brand=brand).delete()
        if deleted:
            return Response({"detail": "Left community successfully."}, status=status.HTTP_200_OK)
        return Response({"detail": "Not a member."}, status=status.HTTP_400_BAD_REQUEST)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductLiteSerializer
        return ProductSerializer

    def get_queryset(self):
        # Base select/prefetch
        qs = Product.objects.select_related(
            'vendor__brand', 
            'category'
        ).prefetch_related(
            'variants', 
            'images', 
            'features', 
            'specifications', 
            'collections'
        )
        
        # Apply filters
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        brand_slug = self.request.query_params.get('brand', None)
        if brand_slug:
            qs = qs.filter(vendor__brand__slug=brand_slug)

        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)

        q = self.request.query_params.get('q', None)
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(short_description__icontains=q))

        user = self.request.user
        if user.is_staff:
            pass
        elif user.is_authenticated and hasattr(user, 'vendor_profile'):
            qs = qs.filter(
                Q(status='approved') |
                Q(vendor__user=user)
            )
        else:
            qs = qs.filter(status='approved')

        sort = self.request.query_params.get('sort', None)
        if sort == 'price_asc':
            qs = qs.order_by('price')
        elif sort == 'price_desc':
            qs = qs.order_by('-price')
        elif sort == 'newest':
            qs = qs.order_by('-created_at')

        return qs

class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vendor.objects.select_related('brand').all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by("-created_at").prefetch_related("items__product__vendor__brand", "items__product__category", "items__product__images")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class VendorDashboardAPIView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        vendor = request.user.vendor_profile
        from django.db.models import Count, Q, Sum
        product_stats = vendor.products.aggregate(
            total_products=Count('id'),
            pending_products=Count('id', filter=Q(status='pending')),
            approved_products=Count('id', filter=Q(status='approved'))
        )
        
        from .models import ProductVariant, Order, VendorNotification
        from django.utils import timezone
        from datetime import timedelta

        total_variants = ProductVariant.objects.filter(product__vendor=vendor).count()
        
        # Earnings are ONLY created for confirmed orders (signal fires on confirmation)
        # So filtering by confirmed here is just for clarity/safety
        confirmed_earnings = vendor.earnings.filter(order__payment_status='confirmed')
        earning_stats = confirmed_earnings.aggregate(
            total_revenue=Sum('gross_amount'),
            total_commission=Sum('commission_amount'),
            pending_payout=Sum('net_amount', filter=Q(status='pending'))
        )
        
        # Show ALL orders containing vendor products — vendors need to see new orders
        # regardless of payment confirmation status (admin confirms separately)
        all_vendor_orders = Order.objects.filter(
            items__product__vendor=vendor
        ).distinct()
        one_day_ago = timezone.now() - timedelta(days=1)
        order_stats = all_vendor_orders.aggregate(
            total_orders=Count('id'),
            orders_today=Count('id', filter=Q(created_at__gte=one_day_ago))
        )
        
        # Recent orders — show all so vendors can see incoming orders awaiting confirmation
        from .serializers import VendorOrderSerializer, VendorNotificationSerializer
        recent_orders_qs = all_vendor_orders.order_by('-created_at')[:5].prefetch_related(
            'items__product', 'customer'
        )
        recent_notifications_qs = vendor.vendor_notifications.order_by('-created_at')[:5]
        
        recent_orders = VendorOrderSerializer(recent_orders_qs, many=True, context={'request': request}).data
        recent_notifications = VendorNotificationSerializer(recent_notifications_qs, many=True).data
        
        return Response({
            "brand_name": vendor.brand_name,
            "total_products": product_stats['total_products'],
            "approved_products": product_stats['approved_products'],
            "pending_products": product_stats['pending_products'],
            "total_variants": total_variants,
            "total_orders": order_stats['total_orders'],
            "orders_today": order_stats['orders_today'],
            "total_revenue": earning_stats['total_revenue'] or 0,
            "total_commission": earning_stats['total_commission'] or 0,
            "commission_rate": vendor.commission_rate,
            "vendor_balance": vendor.payout_balance,
            "pending_payout": earning_stats['pending_payout'] or 0,
            "recent_orders": recent_orders,
            "recent_notifications": recent_notifications
        })

class VendorAnalyticsAPIView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        vendor = request.user.vendor_profile
        from .models import Order, VendorEarning, Product
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate
        from django.utils import timezone
        from datetime import timedelta

        # 1. Daily Revenue (Last 30 days) — confirmed orders only
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        daily_revenue = (
            VendorEarning.objects.filter(
                vendor=vendor,
                created_at__date__gte=thirty_days_ago,
                order__payment_status='confirmed'
            )
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(revenue=Sum('gross_amount'))
            .order_by('date')
        )

        # 2. Top Products by Revenue — confirmed orders only
        from django.db.models import F
        top_products = (
            OrderItem.objects.filter(product__vendor=vendor, order__payment_status='confirmed')
            .values('product__name', 'product__id')
            .annotate(
                revenue=Sum(F('price') * F('quantity')),
                sales=Sum('quantity')
            )
            .order_by('-revenue')[:5]
        )

        # 3. Category Distribution
        category_data = (
            Product.objects.filter(vendor=vendor)
            .values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            "daily_revenue": list(daily_revenue),
            "top_products": list(top_products),
            "category_distribution": list(category_data)
        })

class VendorCommunityView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        vendor = request.user.vendor_profile
        if not vendor.brand:
            return Response({"detail": "Brand not found."}, status=status.HTTP_404_NOT_FOUND)
        
        members = vendor.brand.community_members.all().order_by('-joined_at')
        serializer = BrandCommunityMemberSerializer(members, many=True)
        
        return Response({
            "brand_name": vendor.brand_name,
            "members_count": members.count(),
            "members": serializer.data
        })

class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = VendorProductSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        return Product.objects.filter(vendor=self.request.user.vendor_profile)

    def perform_create(self, serializer):
        # Force status to pending and set vendor
        product = serializer.save(
            vendor=self.request.user.vendor_profile,
            status='pending'
        )
        self._handle_media(product)

    def perform_update(self, serializer):
        # Ensure status and vendor cannot be changed
        product = serializer.save(
            vendor=self.request.user.vendor_profile
        )
        self._handle_media(product)

    def _handle_media(self, product):
        # Additional Images (Gallery)
        images = self.request.FILES.getlist('uploaded_images')
        if images:
            ProductImage.objects.filter(product=product).delete()
            for idx, img in enumerate(images):
                ProductImage.objects.create(
                    product=product,
                    image=img,
                    is_primary=(idx == 0),
                    order=idx
                )

        # 360 Video - Fix: Extract from request.FILES and handle outside 'if images'
        video_360 = self.request.FILES.get('uploaded_video_360')
        if video_360:
            from .models import Product360Video
            # Recreate to ensure only one exists (OneToOneField)
            Product360Video.objects.filter(product=product).delete()
            Product360Video.objects.create(
                product=product,
                video=video_360
            )

        # Handle Variants
        variants_data = self.request.data.get('variants')
        if variants_data:
            if isinstance(variants_data, str):
                import json
                try:
                    variants_data = json.loads(variants_data)
                except:
                    variants_data = []
            
            from .models import ProductVariant
            product.variants.all().delete()
            for var in variants_data:
                # Fix: Handle empty stock string from frontend text input
                stock_val = var.get('stock')
                try:
                    if stock_val == '' or stock_val is None:
                        stock = 0
                    else:
                        stock = int(stock_val)
                except (ValueError, TypeError):
                    stock = 0

                ProductVariant.objects.create(
                    product=product,
                    name=var.get('name') or "Unnamed Variant",
                    stock=stock
                )

        # Handle Specifications
        specs_data = self.request.data.get('specifications')
        if specs_data:
            if isinstance(specs_data, str):
                import json
                try:
                    specs_data = json.loads(specs_data)
                except:
                    specs_data = []
            
            from .models import ProductSpecification
            product.specifications.all().delete()
            for spec in specs_data:
                ProductSpecification.objects.create(
                    product=product,
                    name=spec.get('name') or "Unnamed Specification",
                    value=spec.get('value') or "N/A"
                )

class VendorOrderViewSet(viewsets.ModelViewSet):
    serializer_class = VendorOrderSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        # Show ALL orders containing the vendor's products.
        # Vendors must see new orders immediately after checkout.
        # Payment confirmation (admin step) is separate from order visibility.
        return Order.objects.filter(
            items__product__vendor=self.request.user.vendor_profile
        ).distinct().order_by('-created_at')

    def update(self, request, *args, **kwargs):
        """
        Vendors can update item statuses, but ONLY if the payment is confirmed.
        Prevents vendors from processing un-paid orders.
        """
        order = self.get_object()

        # ── GUARD: Payment must be confirmed ─────────────────────────────────
        if order.payment_status != 'confirmed':
            return Response(
                {"error": "Cannot update order status until payment is confirmed by admin."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('order_status')

        # Vendors can only move items to processing, shipped, or delivered
        vendor_allowed_statuses = ['processing', 'shipped', 'delivered']
        if new_status and new_status not in vendor_allowed_statuses:
            return Response(
                {"error": f"Vendors can only set status to: {', '.join(vendor_allowed_statuses)}"},
                status=400
            )
            
        if new_status:
            vendor = request.user.vendor_profile
            items = order.items.filter(product__vendor=vendor)
            for item in items:
                item.status = new_status
                item.save()
        
        return Response(VendorOrderSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['post'], url_path='items/(?P<item_id>[^/.]+)/status')
    def update_item_status(self, request, pk=None, item_id=None):
        order = self.get_object()
        vendor = request.user.vendor_profile

        # ── GUARD: Payment must be confirmed ─────────────────────────────────
        if order.payment_status != 'confirmed':
            return Response(
                {"error": "Cannot update item status until payment is confirmed by admin."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            item = order.items.get(id=item_id, product__vendor=vendor)
        except OrderItem.DoesNotExist:
            return Response({"error": "OrderItem not found or does not belong to your brand."}, status=404)

        new_status = request.data.get('status')
        # Vendors can only move to processing, shipped, or delivered
        vendor_allowed_statuses = ['processing', 'shipped', 'delivered']
        
        if new_status not in vendor_allowed_statuses:
            return Response(
                {"error": f"Vendors can only set status to: {', '.join(vendor_allowed_statuses)}"},
                status=400
            )
            
        item.status = new_status
        item.save()
        
        return Response({
            "status": "success",
            "item_id": item.id,
            "new_item_status": item.status,
            "overall_order_status": order.order_status
        })

class VendorEarningViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VendorEarningSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        return self.request.user.vendor_profile.earnings.all()

class VendorWithdrawalViewSet(viewsets.ModelViewSet):
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        return self.request.user.vendor_profile.withdrawals.all()

    def perform_create(self, serializer):
        from django.db import transaction
        amount = serializer.validated_data.get('amount', 0)
        
        if amount <= 0:
            raise PermissionDenied("Withdrawal amount must be greater than zero.")
            
        with transaction.atomic():
            # Lock the vendor row explicitly to prevent concurrent withdrawals
            vendor = Vendor.objects.select_for_update().get(id=self.request.user.vendor_profile.id)
            
            if amount > vendor.payout_balance:
                raise PermissionDenied("Cannot withdraw more than available balance.")
            
            # Deduct immediately
            vendor.payout_balance -= amount
            vendor.save()
            
            serializer.save(vendor=vendor, status='pending')

class VendorNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = VendorNotificationSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        return self.request.user.vendor_profile.vendor_notifications.all()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        vendor = request.user.vendor_profile
        vendor.vendor_notifications.filter(read=False).update(read=True)
        return Response({'status': 'all marked as read'})

class VendorSettingsView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        brand = request.user.vendor_profile.brand
        if not brand:
            return Response({"error": "No brand associated with vendor."}, status=404)
        serializer = VendorBrandSettingsSerializer(brand)
        return Response(serializer.data)

    def put(self, request):
        brand = request.user.vendor_profile.brand
        if not brand:
            return Response({"error": "No brand associated with vendor."}, status=404)
        serializer = VendorBrandSettingsSerializer(brand, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class InitializePaymentView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        items_data = request.data.get('items', [])
        guest_email = request.data.get('guest_email')
        
        if not items_data:
            return Response({"error": "No items in order"}, status=400)

        # Determine customer and email
        customer = request.user if request.user.is_authenticated else None
        
        # Paystack requires an email. Priority: User Email > Guest Email
        user_email = request.user.email if customer else guest_email
        
        if not user_email:
            return Response({
                "error": "Email is required to process payments. Please provide a guest email or log in."
            }, status=400)

        # Shipping Info
        shipping_data = {}
        address_id = request.data.get('address_id')
        if address_id and customer:
            try:
                addr = UserAddress.objects.get(id=address_id, user=customer)
                shipping_data = {
                    'shipping_full_name': addr.full_name,
                    'shipping_phone_number': addr.phone_number,
                    'shipping_address_line1': addr.address_line1,
                    'shipping_address_line2': addr.address_line2,
                    'shipping_city': addr.city,
                    'shipping_state': addr.state,
                    'shipping_zip_code': addr.zip_code,
                    'shipping_country': addr.country,
                }
            except UserAddress.DoesNotExist:
                return Response({"error": "Selected address not found"}, status=400)
        else:
            # Guest or manual address
            shipping_data = {
                'shipping_full_name': request.data.get('shipping_full_name'),
                'shipping_phone_number': request.data.get('shipping_phone_number'),
                'shipping_address_line1': request.data.get('shipping_address_line1'),
                'shipping_address_line2': request.data.get('shipping_address_line2'),
                'shipping_city': request.data.get('shipping_city'),
                'shipping_state': request.data.get('shipping_state'),
                'shipping_zip_code': request.data.get('shipping_zip_code'),
                'shipping_country': request.data.get('shipping_country', 'Nigeria'),
            }

            # ── VALIDATION: Ensure required manual shipping details are present ─────
            required_fields = [
                'shipping_full_name', 'shipping_phone_number', 
                'shipping_address_line1', 'shipping_city', 'shipping_state'
            ]
            missing = [f for f in required_fields if not shipping_data.get(f)]
            if missing:
                return Response({
                    "error": f"Missing required shipping information: {', '.join(missing)}",
                    "details": "Please provide either an address_id or full shipping details."
                }, status=400)

        total_amount = 0
        
        from django.db import transaction
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    customer=customer,
                    guest_email=user_email if not customer else None,
                    total_amount=0,
                    payment_status='pending',
                    order_status='pending',
                    **shipping_data
                )

                # Fetch all products in one query to avoid N+1
                product_ids = [int(item['id']) for item in items_data]
                products_map = {
                    p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
                }

                for item in items_data:
                    product = products_map.get(int(item['id']))
                    if not product:
                        raise ValueError(f"Product {item['id']} not found")
                        
                    qty = int(item.get('quantity', 1))
                    if qty <= 0:
                        raise ValueError(f"Quantity for {product.name} must be greater than zero.")
                    if product.stock < qty:
                        raise ValueError(f"Insufficient stock for {product.name}. Only {product.stock} available.")
                        
                    price = product.price
                    product.stock -= qty
                    product.save()
                    
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=qty,
                        price=price
                    )
                    total_amount += price * qty

                order.total_amount = total_amount
                order.save()
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # Notify superuser of order initiation
        try:
            from core.email_service import send_platform_email
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
            superusers = User.objects.filter(is_superuser=True)
            admin_emails = [admin.email for admin in superusers if admin.email]
            if admin_emails:
                customer_display = user_email if not customer else customer.email
                send_platform_email(
                    subject=f'New Order Initiated — Order #{order.id}',
                    template_name='order/admin_order_initiated.html',
                    context={
                        'order': order,
                        'customer_display': customer_display,
                        'admin_orders_url': f'{frontend_url}/dashboard/admin/orders',
                    },
                    recipient_list=admin_emails,
                )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"[checkout] Admin initiation email error: {e}")

        # Using determined user_email (User or Guest)

        if total_amount <= 0:
            return Response({
                "error": "Invalid order total. Amount must be greater than zero."
            }, status=400)

        # Call Paystack
        paystack_url = "https://api.paystack.co/transaction/initialize"
        # Using placeholder secret key - user should set this in env
        headers = {
            "Authorization": f"Bearer {getattr(settings, 'PAYSTACK_SECRET_KEY', 'sk_test_placeholder')}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "email": user_email,
            "amount": int(total_amount * 100), # Paystack uses kobo/cents
            "callback_url": f"{request.data.get('redirect_url')}",
            "metadata": {
                "order_id": order.id,
                "customer_id": request.user.id
            }
        }

        try:
            response = requests.post(paystack_url, headers=headers, json=payload)
            res_data = response.json()
            if res_data.get('status'):
                order.paystack_reference = res_data['data']['reference']
                order.save(update_fields=['paystack_reference'])
                
                return Response({
                    "authorization_url": res_data['data']['authorization_url'],
                    "reference": res_data['data']['reference']
                })
            
            # Print for server terminal logs
            print("--- PAYSTACK ERROR ---")
            print(f"Payload: {payload}")
            print(f"Response: {res_data}")
            with transaction.atomic():
                for item in order.items.select_related('product'):
                    prod = Product.objects.select_for_update().get(id=item.product.id)
                    prod.stock += item.quantity
                    prod.save()
                order.order_status = 'cancelled'
                order.save()
            return Response({"error": "Paystack initialization failed", "details": res_data}, status=400)
        except Exception as e:
            print(f"--- PAYSTACK EXCEPTION ---: {str(e)}")
            with transaction.atomic():
                for item in order.items.select_related('product'):
                    prod = Product.objects.select_for_update().get(id=item.product.id)
                    prod.stock += item.quantity
                    prod.save()
                order.order_status = 'cancelled'
                order.save()
            return Response({"error": str(e)}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class PaystackWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.headers.get('x-paystack-signature')
        secret = getattr(settings, 'PAYSTACK_SECRET_KEY', 'sk_test_placeholder')

        if not sig_header:
            return Response({"error": "No signature"}, status=400)

        # Verify signature
        hash = hmac.new(secret.encode('utf-8'), payload, hashlib.sha512).hexdigest()
        if hash != sig_header:
            return Response({"error": "Invalid signature"}, status=400)

        event = json.loads(payload)
        import logging
        logger = logging.getLogger(__name__)
        from .email_service import send_platform_email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
        
        # ── 1. Handle Successful Payment ──────────────────────────────────────
        if event['event'] == 'charge.success':
            order_id = event['data']['metadata'].get('order_id')
            try:
                order = Order.objects.get(id=order_id)
                if order.payment_status == 'pending':
                    order.payment_status = 'paid'
                    order.order_status = 'processing' # Automated transition
                    order.save()

                    customer_display = (
                        order.customer.email if order.customer else order.guest_email or 'Guest'
                    )
                    
                    # A. Notify Superusers (Admins)
                    superusers = User.objects.filter(is_superuser=True)
                    for admin in superusers:
                        # In-app
                        try:
                            Notification.objects.create(
                                user=admin,
                                title=f'Action Required: Payment Received — Order #{order.id}',
                                body=f'A new payment of ₦{order.total_amount:,.2f} has been received for Order #{order.id} from {customer_display}.'
                            )
                        except Exception as e:
                            logger.error(f"[webhook] Admin Notification error: {e}")

                        # Email
                        if admin.email:
                            try:
                                send_platform_email(
                                    subject=f'Action Required: New Payment — Order #{order.id}',
                                    template_name='order/admin_payment_alert.html',
                                    context={
                                        'order': order,
                                        'customer_display': customer_display,
                                        'admin_orders_url': f'{frontend_url}/dashboard/admin/orders',
                                    },
                                    recipient_list=[admin.email],
                                )
                            except Exception as e:
                                logger.error(f"[webhook] Admin Email error: {e}")

                    # B. Notify Customer (Immediate Feedback)
                    user_email = (order.customer.email if order.customer else order.guest_email)
                    if user_email:
                        try:
                            # 1. In-app Notification for registered users
                            if order.customer:
                                Notification.objects.create(
                                    user=order.customer,
                                    title=f'Transmission Received: Order #{order.id}',
                                    body=f'Your payment of ₦{order.total_amount:,.2f} has been detected. Our Comraid team is now verifying the transaction.'
                                )
                            
                            # 2. Email Confirmation (Registered and Guest)
                            send_platform_email(
                                subject=f'Payment Received — Order #{order.id}',
                                template_name='order/payment_received.html',
                                context={
                                    'user': order.customer,
                                    'order': order,
                                    'order_url': f'{frontend_url}/dashboard/user/orders',
                                },
                                recipient_list=[user_email],
                            )
                        except Exception as e:
                            logger.error(f"[webhook] Customer Notification error: {e}")
                else:
                    logger.info(f"[webhook] Order #{order.id} payment status is already '{order.payment_status}'")
            except Order.DoesNotExist:
                logger.warning(f"[webhook] Order with ID {order_id} not found")
            except Exception as e:
                logger.error(f"[webhook] General error processing charge.success: {e}")
            
            # Handle "Save Card"
            save_card = event['data']['metadata'].get('save_card')
            if save_card:
                customer_id = event['data']['metadata'].get('customer_id')
                try:
                    user = User.objects.get(id=customer_id)
                    auth = event['data']['authorization']
                    SavedCard.objects.get_or_create(
                        user=user,
                        authorization_code=auth['authorization_code'],
                        defaults={
                            'last4': auth['last4'],
                            'exp_month': auth['exp_month'],
                            'exp_year': auth['exp_year'],
                            'card_type': auth['card_type'],
                            'bank': auth.get('bank', ''),
                        }
                    )
                except User.DoesNotExist:
                    pass

        # ── 2. Handle Failed Payment ──────────────────────────────────────────
        elif event['event'] == 'charge.failed':
            order_id = event['data']['metadata'].get('order_id')
            try:
                order = Order.objects.get(id=order_id)
                if order.payment_status == 'pending':
                    order.payment_status = 'failed'
                    order.order_status = 'cancelled' # Automated transition
                    order.save()

                    user_email = (order.customer.email if order.customer else order.guest_email)
                    customer_display = user_email or 'Guest'
                    
                    # 1. Notify Superusers (Admins) about failure
                    superusers = User.objects.filter(is_superuser=True)
                    admin_emails = []
                    for admin in superusers:
                        # In-app
                        try:
                            Notification.objects.create(
                                user=admin,
                                title=f'Payment Failed — Order #{order.id}',
                                body=f'A payment of ₦{order.total_amount:,.2f} from {customer_display} failed.'
                            )
                        except Exception as e:
                            logger.error(f"[webhook] Admin Failure Notification error: {e}")
                        
                        if admin.email:
                            admin_emails.append(admin.email)

                    if admin_emails:
                        try:
                            send_platform_email(
                                subject=f'Action Warning: Payment Failed — Order #{order.id}',
                                template_name='order/admin_payment_failed_alert.html',
                                context={
                                    'order': order,
                                    'customer_display': customer_display,
                                    'admin_orders_url': f'{frontend_url}/dashboard/admin/orders',
                                },
                                recipient_list=admin_emails,
                            )
                        except Exception as e:
                            logger.error(f"[webhook] Admin Failure Email error: {e}")

                    # 2. Notify Customer
                    if user_email:
                        try:
                            # 1. In-app Notification
                            if order.customer:
                                Notification.objects.create(
                                    user=order.customer,
                                    title=f'Payment Failed: Order #{order.id}',
                                    body=f'The payment transmission for your acquisition #{order.id} was interrupted. Please review your billing details.'
                                )
                            
                            # 2. Email Notification
                            send_platform_email(
                                subject=f'Payment Signal Interrupted — Order #{order.id}',
                                template_name='order/payment_failed.html',
                                context={
                                    'user': order.customer,
                                    'order': order,
                                    'order_url': f'{frontend_url}/dashboard/user/orders',
                                },
                                recipient_list=[user_email],
                            )
                        except Exception as e:
                            logger.error(f"[webhook] Customer Failure Notification error: {e}")
            except Order.DoesNotExist:
                logger.warning(f"[webhook] Order with ID {order_id} not found for failure event")
            except Exception as e:
                logger.error(f"[webhook] General error processing charge.failed: {e}")

        return Response({"status": "success"}, status=200)


from .email_service import send_platform_email


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        if user.email:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
            send_platform_email(
                subject="Welcome to ComraidShops",
                template_name="auth/welcome.html",
                context={"user": user, "login_url": f"{frontend_url}/login"},
                recipient_list=[user.email]
            )

class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserAddressSerializer

    def get_queryset(self):
        return UserAddress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is default, unset other defaults
        if serializer.validated_data.get('is_default'):
            UserAddress.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)

class SavedCardViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedCardSerializer
    http_method_names = ['get', 'delete'] # Only list and delete for safety

    def get_queryset(self):
        return SavedCard.objects.filter(user=self.request.user)


class UserNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists notifications for the currently authenticated user.
    Supports marking individual notifications as read.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})


class ChangePasswordView(APIView):
    """
    Allows an authenticated user to change their password.
    POST: { current_password, new_password }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password or not new_password:
            return Response({'error': 'Both current_password and new_password are required.'}, status=400)

        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters.'}, status=400)

        user = request.user
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully.'})

class FitFrameViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FitFrame.objects.all()
    serializer_class = FitFrameSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = FitFrame.objects.select_related("brand").prefetch_related("items__product", "items__product__vendor__brand")
        if self.action == 'list':
            return qs.filter(is_featured=True)
        return qs

class SavedFitFrameViewSet(viewsets.ModelViewSet):
    serializer_class = SavedFitFrameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedFitFrame.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        fitframe = serializer.validated_data['fitframe']
        if SavedFitFrame.objects.filter(user=self.request.user, fitframe=fitframe).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already saved this fit.")
        serializer.save(user=self.request.user)

class HomepageSlideViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomepageSlide.objects.filter(is_active=True).order_by('order')[:4]
    serializer_class = HomepageSlideSerializer
    permission_classes = [permissions.AllowAny]

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=400)
            
        users = User.objects.filter(email__iexact=email)
        if users.exists():
            user = users.first()
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            
            send_platform_email(
                subject="ComraidShops - Password Reset Request",
                template_name="auth/password_reset.html",
                context={"user": user, "reset_url": reset_url},
                recipient_list=[user.email]
            )
            
        return Response({'message': 'If an account with that email exists, a password reset link has been sent.'})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uidb64, token, new_password]):
            return Response({'error': 'Missing required fields.'}, status=400)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            if len(new_password) < 8:
                return Response({'error': 'Password must be at least 8 characters.'}, status=400)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'})
        else:
            return Response({'error': 'Invalid or expired token.'}, status=400)

class VerifyEmailRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.email:
            return Response({'error': 'No email found for user.'}, status=400)
            
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')
        verify_url = f"{frontend_url}/verify-email?uid={uid}&token={token}"
        
        send_platform_email(
            subject="Verify your ComraidShops Email",
            template_name="auth/email_verification.html",
            context={"user": user, "verify_url": verify_url},
            recipient_list=[user.email]
        )
        return Response({'message': 'Verification email sent.'})

import requests as http_requests

class GoogleLogin(APIView):
    """
    Self-contained Google OAuth2 login.
    Exchanges an authorization code for Google tokens, fetches user info,
    creates/finds the Django user, and returns JWT tokens.
    
    No dependency on dj-rest-auth or allauth social login machinery,
    which avoids version incompatibility issues.
    """
    permission_classes = [permissions.AllowAny]

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {"error": "Authorization code is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine callback_url: prefer frontend-sent value, fallback to env
        callback_url = request.data.get('callback_url', '').strip()
        if not callback_url:
            callback_url = config(
                "GOOGLE_OAUTH_CALLBACK_URL",
                default="http://localhost:3000/auth/callback"
            ).strip()

        client_id = config("GOOGLE_CLIENT_ID", default="")
        client_secret = config("GOOGLE_CLIENT_SECRET", default="")

        if not client_id or not client_secret:
            return Response(
                {"error": "Google OAuth is not configured on the server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # ── Step 1: Exchange authorization code for tokens ────────────────────
        token_response = http_requests.post(self.GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": callback_url,
            "grant_type": "authorization_code",
        })

        token_data = token_response.json()

        if "error" in token_data:
            print(f"[GoogleLogin ERROR] Token exchange failed: {token_data}")
            print(f"[GoogleLogin DEBUG] Used redirect_uri: '{callback_url}'")
            return Response(
                {
                    "error": f"Google token exchange failed: {token_data.get('error_description', token_data['error'])}",
                    "detail": f"redirect_uri used: '{callback_url}'"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        access_token = token_data.get("access_token")

        # ── Step 2: Fetch user info from Google ──────────────────────────────
        userinfo_response = http_requests.get(
            self.GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if userinfo_response.status_code != 200:
            return Response(
                {"error": "Failed to fetch user info from Google."},
                status=status.HTTP_400_BAD_REQUEST
            )

        userinfo = userinfo_response.json()
        email = userinfo.get("email")
        first_name = userinfo.get("given_name", "")
        last_name = userinfo.get("family_name", "")
        google_id = userinfo.get("id")

        if not email:
            return Response(
                {"error": "Google account has no email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Step 3: Create or get user ───────────────────────────────────────
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Create a new user with a username derived from email
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            # Set unusable password since they're using Google auth
            user.set_unusable_password()
            user.save()

            # Send welcome email for Google registrations
            from core.email_service import send_platform_email
            frontend_url = config('FRONTEND_URL', default='https://comraidshops.art')
            send_platform_email(
                subject="Welcome to ComraidShops",
                template_name="auth/welcome.html",
                context={"user": user, "login_url": f"{frontend_url}/login"},
                recipient_list=[user.email]
            )

        # ── Step 4: Issue JWT tokens ─────────────────────────────────────────
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        })


class DiagnosticEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.GET.get('email', 'test@example.com')
        api_key = getattr(settings, 'RESEND_API_KEY', '')
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
        
        diagnostic = {
            "ENV_api_key_starts_with": api_key[:10] if api_key else "EMPTY_OR_NONE",
            "ENV_from_email": from_email,
            "test_target": email
        }

        if not api_key:
            diagnostic["error"] = "RESEND_API_KEY is empty in Django settings."
            return Response(diagnostic)

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": from_email,
            "to": [email],
            "subject": "Diagnostic Test",
            "html": "<p>Test email</p>"
        }
        
        try:
            response = http_requests.post(url, headers=headers, json=payload, timeout=10)
            diagnostic["resend_status"] = response.status_code
            try:
                diagnostic["resend_response"] = response.json()
            except:
                diagnostic["resend_response"] = response.text
        except Exception as e:
            diagnostic["resend_exception"] = str(e)

        return Response(diagnostic)


