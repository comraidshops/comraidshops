from rest_framework import viewsets, permissions, status, generics

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from .models import (
    User, Vendor, Product, Order, Category, Brand, Magazine, Article, 
    Exhibition, Collection, HomepageSlide, WithdrawalRequest, VendorEarning, Commission, GlobalCommission,
    FitFrame, ProductImage, Product360Video
)
from .serializers import (
    UserSerializer, VendorSerializer, ProductSerializer, OrderSerializer,
    CategorySerializer, BrandSerializer, MagazineSerializer, ExhibitionSerializer,
    CollectionSerializer, HomepageSlideSerializer, WithdrawalRequestSerializer,
    VendorEarningSerializer, CommissionSerializer, ArticleSerializer, FitFrameSerializer
)

# --- Administrative Serializers ---

class AdminUserSerializer(UserSerializer):
    vendor_brand_id = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['is_superuser', 'is_staff', 'is_vendor_approved', 'date_joined', 'last_login', 'vendor_brand_id']
        read_only_fields = ['date_joined', 'last_login']

    def get_vendor_brand_id(self, obj):
        if obj.is_vendor and hasattr(obj, 'vendor_profile') and obj.vendor_profile.brand:
            return obj.vendor_profile.brand.id
        return None

class AdminVendorSerializer(VendorSerializer):
    user_details = AdminUserSerializer(source='user', read_only=True)
    class Meta(VendorSerializer.Meta):
        fields = VendorSerializer.Meta.fields + ['user_details', 'payout_balance']

class AdminCategorySerializer(CategorySerializer):
    class Meta(CategorySerializer.Meta):
        fields = CategorySerializer.Meta.fields

class AdminProductSerializer(ProductSerializer):
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields

# --- Administrative ViewSets ---

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        stats = {
            'total_orders': Order.objects.count(),
            # Only count revenue from CONFIRMED payments
            'total_revenue': Order.objects.filter(payment_status='confirmed').aggregate(
                Sum('total_amount')
            )['total_amount__sum'] or 0,
            'pending_revenue': Order.objects.filter(payment_status='paid').aggregate(
                Sum('total_amount')
            )['total_amount__sum'] or 0,
            'total_payouts': WithdrawalRequest.objects.filter(status='paid').aggregate(
                Sum('amount')
            )['amount__sum'] or 0,
            # Only sum commissions from confirmed orders
            'platform_commission': VendorEarning.objects.filter(
                order__payment_status='confirmed'
            ).aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0,
            'active_commission': (
                GlobalCommission.objects.filter(is_active=True)
                .order_by('-created_at').first().rate
                if GlobalCommission.objects.filter(is_active=True).exists()
                else '10.00'
            ),
            'active_vendors': User.objects.filter(is_vendor_approved=True).count(),
            'pending_vendors': User.objects.filter(is_vendor=True, is_vendor_approved=False).count(),
            'pending_products': Product.objects.filter(status='pending').count(),
            'total_products': Product.objects.count(),
            'low_stock_count': Product.objects.filter(stock__lt=5).count(),
            # Failed orders transparency
            'failed_orders': Order.objects.filter(payment_status='failed').count(),
            'cancelled_orders': Order.objects.filter(order_status='cancelled').count(),
        }
        return Response(stats)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        user = serializer.save()
        
        # Auto-create Vendor profile if is_vendor is checked
        if user.is_vendor and not hasattr(user, 'vendor_profile'):
            Vendor.objects.create(
                user=user, 
                brand_name=user.username,
                commission_rate=0.10
            )

        # Handle Brand Assignment if 'vendor_brand_id' is passed in the request
        brand_id = self.request.data.get('vendor_brand_id')
        if user.is_vendor and brand_id:
            try:
                brand = Brand.objects.get(id=brand_id)
                user.vendor_profile.brand = brand
                user.vendor_profile.brand_name = brand.name
                user.vendor_profile.save()
            except Brand.DoesNotExist:
                pass

    @action(detail=True, methods=['post'])
    def approve_vendor(self, request, pk=None):
        user = self.get_object()
        if not user.is_vendor:
            return Response({'error': 'User is not a vendor'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_vendor_approved = True
        user.save()
        
        # Optionally assign a brand during approval
        brand_id = request.data.get('brand_id')
        if brand_id and hasattr(user, 'vendor_profile'):
            try:
                brand = Brand.objects.get(id=brand_id)
                user.vendor_profile.brand = brand
                user.vendor_profile.save()
            except Brand.DoesNotExist:
                return Response({'error': f'Brand with ID {brand_id} not found'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Send Vendor Approval Email
        from .email_service import send_platform_email
        if hasattr(user, 'vendor_profile'):
            send_platform_email(
                subject="ComraidShops Vendor Application Approved",
                template_name="vendor/vendor_approval.html",
                context={"vendor": user.vendor_profile},
                recipient_list=[user.email]
            )
            
        return Response({'status': 'vendor approved', 'brand_assigned': brand_id if brand_id else False})

class AdminVendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = AdminVendorSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = AdminCategorySerializer
    permission_classes = [permissions.IsAdminUser]

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = AdminProductSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        product = serializer.save()
        self._handle_media(product)

    def perform_update(self, serializer):
        product = serializer.save()
        self._handle_media(product)

    def _handle_media(self, product):
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
                
        video_360 = self.request.FILES.get('uploaded_video_360')
        if video_360:
            if hasattr(product, 'video_360'):
                product.video_360.delete()
            Product360Video.objects.create(
                product=product,
                video=video_360
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        product = self.get_object()
        product.status = 'approved'
        product.save()
        
        # Send Product Approval Email
        from .email_service import send_platform_email
        vendor = product.vendor
        if vendor and vendor.user and vendor.user.email:
            send_platform_email(
                subject=f"Product Approved: {product.name}",
                template_name="vendor/product_approval.html",
                context={"vendor": vendor, "product": product},
                recipient_list=[vendor.user.email]
            )
            
        return Response({'status': 'product approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        product = self.get_object()
        product.status = 'draft' # Or rejected
        product.save()
        
        # Send Product Rejection Email
        from .email_service import send_platform_email
        vendor = product.vendor
        if vendor and vendor.user and vendor.user.email:
            send_platform_email(
                subject=f"Product Submission Update: {product.name}",
                template_name="vendor/product_rejection.html",
                context={"vendor": vendor, "product": product},
                recipient_list=[vendor.user.email]
            )
            
        return Response({'status': 'product rejected'})

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at').prefetch_related(
        'items__product__vendor', 'items__product__images'
    )
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'head', 'options', 'post']  # No direct PUT/PATCH/DELETE

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """
        Admin confirms a payment. This is the ONLY place that transitions
        payment_status to 'confirmed', which triggers earnings creation
        via the post_save signal.

        Eligible transitions: pending → confirmed, paid → confirmed
        """
        from django.db import transaction
        order = self.get_object()

        if order.payment_status == 'confirmed':
            return Response(
                {'error': 'Payment is already confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.payment_status not in ('pending', 'paid'):
            return Response(
                {'error': f'Cannot confirm an order with payment status "{order.payment_status}".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.payment_status = 'confirmed'
            order.save()

        return Response({
            'status': 'payment confirmed',
            'order_id': order.id,
            'payment_status': order.payment_status,
            'order_status': order.order_status,
        })

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """
        Admin cancels an order. Sets payment_status=failed and order_status=cancelled.
        Does NOT reverse already-cleared payout_balance entries — those must be
        handled via a withdrawal rejection.
        """
        from django.db import transaction
        order = self.get_object()

        if order.order_status == 'cancelled':
            return Response(
                {'error': 'Order is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', 'Cancelled by admin.')

        with transaction.atomic():
            # Atomically restore stock for each item
            from django.db.models import F
            from .models import Product as ProductModel
            for item in order.items.all():
                ProductModel.objects.filter(pk=item.product_id).update(
                    stock=F('stock') + item.quantity
                )

            order.payment_status = 'failed'
            order.order_status = 'cancelled'
            order.save()

        # Notify customer
        if order.customer:
            from .models import Notification
            Notification.objects.create(
                user=order.customer,
                title=f'Order #{order.id} Cancelled',
                body=f'Your order #{order.id} has been cancelled. Reason: {reason}',
            )

        return Response({
            'status': 'order cancelled',
            'order_id': order.id,
            'payment_status': order.payment_status,
            'order_status': order.order_status,
        })

class AdminWithdrawalViewSet(viewsets.ModelViewSet):
    queryset = WithdrawalRequest.objects.all().order_by('-created_at')
    serializer_class = WithdrawalRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        withdrawal = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['approved', 'rejected', 'paid']:
            withdrawal.status = new_status
            withdrawal.save()
            return Response({'status': f'withdrawal {new_status}'})
        return Response({'error': 'invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class AdminEarningViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VendorEarning.objects.all().order_by('-created_at')
    serializer_class = VendorEarningSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCommissionViewSet(viewsets.ModelViewSet):
    queryset = GlobalCommission.objects.all().order_by('-created_at')
    serializer_class = CommissionSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        # Deactivate previous commissions
        GlobalCommission.objects.filter(is_active=True).update(is_active=False)
        serializer.save(is_active=True)

class AdminMagazineViewSet(viewsets.ModelViewSet):
    queryset = Magazine.objects.all().order_by('-created_at')
    serializer_class = MagazineSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id' # Use ID for admin actions

class AdminArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all().order_by('-created_at')
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'



class AdminExhibitionViewSet(viewsets.ModelViewSet):
    queryset = Exhibition.objects.all().order_by('-created_at')
    serializer_class = ExhibitionSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminCollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all().order_by('-created_at')
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminHomepageSlideViewSet(viewsets.ModelViewSet):
    queryset = HomepageSlide.objects.all().order_by('order')
    serializer_class = HomepageSlideSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminFitFrameViewSet(viewsets.ModelViewSet):
    queryset = FitFrame.objects.all().order_by('-created_at')
    serializer_class = FitFrameSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminBrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminBroadcastView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        subject = request.data.get('subject')
        message = request.data.get('message')
        recipients = request.data.get('recipients', []) # list of emails or 'all'
        
        if not subject or not message:
            return Response({'error': 'Subject and message are required.'}, status=400)
            
        from .email_service import send_platform_email
        
        if recipients == 'all':
            target_emails = list(User.objects.exclude(email='').values_list('email', flat=True))
        else:
            target_emails = recipients
            
        if not target_emails:
            return Response({'error': 'No recipients found.'}, status=400)
            
        # Send to each recipient. In a real highly-scaled system, this should be a Celery task.
        for email in target_emails:
            user = User.objects.filter(email=email).first()
            recipient_name = user.username if user else "Member"
            send_platform_email(
                subject=subject,
                template_name="system/admin_broadcast.html",
                context={
                    "email_subject": subject,
                    "email_body": message,
                    "recipient_name": recipient_name
                },
                recipient_list=[email]
            )
            
        return Response({'message': f'Broadcast email sent to {len(target_emails)} recipients.'})
