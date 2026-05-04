from rest_framework import viewsets, permissions, status, generics, serializers

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from .models import (
    User, Vendor, Product, Order, Category, Brand, Magazine, Article, 
    Exhibition, Collection, HomepageSlide, WithdrawalRequest, VendorEarning, Commission, GlobalCommission,
    FitFrame, ProductImage, Product360Video, PlatformEvent
)
from .serializers import (
    UserSerializer, VendorSerializer, ProductSerializer, OrderSerializer,
    CategorySerializer, BrandSerializer, MagazineSerializer, ExhibitionSerializer,
    CollectionSerializer, HomepageSlideSerializer, WithdrawalRequestSerializer,
    VendorEarningSerializer, CommissionSerializer, ArticleSerializer, FitFrameSerializer,
    AdminOrderSerializer
)

# --- Administrative Serializers ---

class AdminUserSerializer(UserSerializer):
    vendor_brand_id = serializers.SerializerMethodField()
    is_investor = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'is_superuser', 'is_staff', 'is_vendor_approved', 
            'date_joined', 'last_login', 'vendor_brand_id',
            'is_investor', 'is_vendor'
        ]
        read_only_fields = ['date_joined', 'last_login']

    def get_vendor_brand_id(self, obj):
        if obj.is_vendor and hasattr(obj, 'vendor_profile') and obj.vendor_profile.brand:
            return obj.vendor_profile.brand.id
        return None

    def get_is_investor(self, obj):
        return hasattr(obj, 'investor_profile')

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

class AdminBrandSerializer(BrandSerializer):
    """
    Admin-safe serializer that provides sensible defaults for
    annotation-backed fields so create/update responses don't crash.
    """
    pass

# --- Administrative ViewSets ---

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            with open('/tmp/comraid_signal_error.log', 'r') as f:
                signal_error_trace = f.read()
        except FileNotFoundError:
            signal_error_trace = None

        stats = {
            'signal_error_trace': signal_error_trace,
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
            'pwa_installs': PlatformEvent.objects.filter(event_type='pwa_install').count(),
            'aov': Order.objects.filter(payment_status='confirmed').aggregate(
                Sum('total_amount')
            )['total_amount__sum'] / Order.objects.filter(payment_status='confirmed').count() if Order.objects.filter(payment_status='confirmed').count() > 0 else 0,
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
        # We use the raw request data to handle explicit null (None) for un-assignment
        if 'vendor_brand_id' in self.request.data:
            brand_id = self.request.data.get('vendor_brand_id')
            
            # Ensure we have a fresh vendor profile if it was just created
            from .models import Vendor as VendorModel
            vendor, _ = VendorModel.objects.get_or_create(
                user=user,
                defaults={'brand_name': user.username, 'commission_rate': 0.10}
            )

            if brand_id in [None, "", "null", 0]:
                vendor.brand = None
                vendor.save()
            else:
                try:
                    brand = Brand.objects.get(id=brand_id)
                    vendor.brand = brand
                    vendor.brand_name = brand.name
                    vendor.save()
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
        # Clear prefetch cache so response serializer sees new media
        if hasattr(product, '_prefetched_objects_cache'):
            product._prefetched_objects_cache = {}

    def perform_update(self, serializer):
        product = serializer.save()
        self._handle_media(product)
        # Clear prefetch cache so response serializer sees new media
        if hasattr(product, '_prefetched_objects_cache'):
            product._prefetched_objects_cache = {}

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
    serializer_class = AdminOrderSerializer
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ['get', 'head', 'options', 'post']  # No direct PUT/PATCH/DELETE

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """
        Admin confirms a payment. This is the ONLY place that transitions
        payment_status to 'confirmed', which triggers earnings creation
        via the post_save signal.

        Notifications are dispatched HERE (not in the signal) using
        transaction.on_commit() so they execute AFTER the DB write succeeds.

        Eligible transitions: pending → confirmed, paid → confirmed
        """
        from django.db import transaction
        import logging
        logger = logging.getLogger(__name__)

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

            # ── Fire notifications AFTER the transaction has committed ────────
            # CRITICAL: on_commit MUST be registered INSIDE the atomic block
            # so Django ties the callback to THIS transaction's commit.
            order_id = order.id
            order_pk = order.pk

            def _send_confirmations():
                """Runs after the atomic block commits — guaranteed to execute."""
                from .models import Notification, VendorNotification
                from .email_service import send_platform_email
                from django.conf import settings
                import logging
                _logger = logging.getLogger(__name__)

                frontend_url = getattr(settings, 'FRONTEND_URL', 'https://comraidshops.art')

                try:
                    # Reload order to get fresh state
                    fresh_order = Order.objects.select_related('customer').prefetch_related(
                        'items__product__vendor__user'
                    ).get(pk=order_pk)
                except Order.DoesNotExist:
                    _logger.error(f"[confirm_payment] Order #{order_pk} not found for notifications")
                    return

                # 1. Customer In-App Notification
                if fresh_order.customer:
                    try:
                        Notification.objects.create(
                            user=fresh_order.customer,
                            title=f'Payment Confirmed — Order #{order_id}',
                            body=(
                                f'Great news! Your payment for Order #{order_id} has been confirmed. '
                                f'Total: ₦{fresh_order.total_amount:,.2f}. Your vendors are preparing your items.'
                            )
                        )
                        _logger.info(f"[confirm_payment] Customer notification created for Order #{order_id}")
                    except Exception as e:
                        _logger.error(f"[confirm_payment] Customer notification error: {e}")

                # 2. Customer Email
                user_email = getattr(fresh_order.customer, 'email', None) or fresh_order.guest_email
                if user_email:
                    try:
                        send_platform_email(
                            subject=f'Payment Confirmed — Order #{order_id}',
                            template_name='order/order_confirmation.html',
                            context={
                                'user': fresh_order.customer,
                                'order': fresh_order,
                                'items': fresh_order.items.all(),
                                'order_url': f'{frontend_url}/dashboard/user/orders/{order_id}',
                            },
                            recipient_list=[user_email],
                        )
                        _logger.info(f"[confirm_payment] Customer email sent to {user_email}")
                    except Exception as e:
                        _logger.error(f"[confirm_payment] Customer email error: {e}")

                # 3. Vendor In-App Notifications + Emails
                vendor_items = {}
                for item in fresh_order.items.select_related('product__vendor__user').all():
                    vendor = item.product.vendor
                    if vendor:
                        vendor_items.setdefault(vendor, []).append(item)

                _logger.info(f"[confirm_payment] Found {len(vendor_items)} vendor(s) for Order #{order_id}")

                for vendor, items in vendor_items.items():
                    # Vendor In-App Notification
                    try:
                        VendorNotification.objects.create(
                            vendor=vendor,
                            message=(
                                f'Payment confirmed for Order #{order_id}. '
                                f'Please begin processing. Items: {", ".join(i.product.name for i in items)}.'
                            ),
                            type='payment_confirmed',
                            read=False,
                        )
                        _logger.info(f"[confirm_payment] VendorNotification created for vendor {vendor.brand_name}")
                    except Exception as e:
                        _logger.error(f"[confirm_payment] Vendor notification error for {vendor.brand_name}: {e}")

                    # Vendor Email
                    vendor_email = getattr(vendor.user, 'email', None) if vendor.user else None
                    if vendor_email:
                        try:
                            send_platform_email(
                                subject=f'New Confirmed Order #{order_id}',
                                template_name='order/vendor_notification.html',
                                context={
                                    'vendor': vendor,
                                    'order': fresh_order,
                                    'vendor_items': items,
                                },
                                recipient_list=[vendor_email],
                            )
                            _logger.info(f"[confirm_payment] Vendor email sent to {vendor_email}")
                        except Exception as e:
                            _logger.error(f"[confirm_payment] Vendor email error for {vendor.brand_name}: {e}")
                    else:
                        _logger.warning(f"[confirm_payment] No email for vendor {vendor.brand_name}, skipping email")

            # Register callback INSIDE atomic block
            transaction.on_commit(_send_confirmations)

        return Response({
            'status': 'payment confirmed',
            'order_id': order.id,
            'payment_status': order.payment_status,
            'order_status': order.order_status,
        })

    @action(detail=True, methods=['post'])
    def verify_paystack(self, request, pk=None):
        """
        Manually verifies the transaction status directly from Paystack API,
        bypassing webhooks, and corrects the Order status if needed.
        """
        order = self.get_object()
        if not order.paystack_reference:
            return Response({"error": "No Paystack reference found for this order. It might have been initialized before this update."}, status=status.HTTP_400_BAD_REQUEST)
        
        import requests
        from django.conf import settings
        secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', None)
        if not secret_key:
            return Response({"error": "Paystack secret key not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        verify_url = f"https://api.paystack.co/transaction/verify/{order.paystack_reference}"
        headers = {"Authorization": f"Bearer {secret_key}"}
        
        try:
            response = requests.get(verify_url, headers=headers)
            data = response.json()
            if data.get('status') and data.get('data'):
                paystack_status = data['data']['status']
                
                # Auto-correct our DB if paystack says success but we are pending
                if paystack_status == 'success' and order.payment_status == 'pending':
                    from django.db import transaction
                    with transaction.atomic():
                        order.payment_status = 'paid'
                        order.order_status = 'processing'
                        order.save(update_fields=['payment_status', 'order_status'])
                    
                elif paystack_status in ['failed', 'abandoned'] and order.payment_status == 'pending':
                    from django.db import transaction
                    with transaction.atomic():
                        order.payment_status = 'failed'
                        order.order_status = 'cancelled'
                        order.save(update_fields=['payment_status', 'order_status'])

                return Response({
                    "paystack_status": paystack_status,
                    "order_payment_status": order.payment_status,
                    "order_status": order.order_status,
                })
            else:
                return Response({"error": data.get('message', 'Failed to verify transaction')}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"[verify_paystack] error: {str(e)}")
            return Response({"error": "Error communicating with Paystack."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    @action(detail=True, methods=['post'])
    def mark_processing(self, request, pk=None):
        """
        Admin marks all order items as processing.
        """
        order = self.get_object()
        if order.payment_status != 'confirmed':
            return Response({'error': 'Payment must be confirmed first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update all items
        for item in order.items.all():
            item.status = 'processing'
            item.save()
            
        return Response({
            'status': 'order marked as processing',
            'order_id': order.id,
            'order_status': order.order_status
        })

    @action(detail=True, methods=['post'])
    def mark_shipped(self, request, pk=None):
        """
        Admin marks all order items as shipped.
        """
        order = self.get_object()
        # Allow shipping if confirmed, regardless of current order_status to be flexible
        if order.payment_status != 'confirmed':
            return Response({'error': 'Payment must be confirmed first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in order.items.all():
            item.status = 'shipped'
            item.save()
            
        return Response({
            'status': 'order marked as shipped',
            'order_id': order.id,
            'order_status': order.order_status
        })

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """
        Admin marks all order items as delivered.
        """
        order = self.get_object()
        if order.payment_status != 'confirmed':
            return Response({'error': 'Payment must be confirmed first.'}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in order.items.all():
            item.status = 'delivered'
            item.save()
            
        return Response({
            'status': 'order marked as delivered',
            'order_id': order.id,
            'order_status': order.order_status
        })

    @action(detail=True, methods=['post'])
    def refund_payment(self, request, pk=None):
        """
        Admin marks payment as refunded.
        """
        order = self.get_object()
        if order.payment_status == 'refunded':
            return Response({'error': 'Payment is already refunded.'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.payment_status = 'refunded'
        order.save()
        
        return Response({
            'status': 'payment refunded',
            'order_id': order.id,
            'payment_status': order.payment_status
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
    queryset = Collection.objects.all().prefetch_related('products', 'gallery').order_by('-created_at')
    serializer_class = CollectionSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        collection = serializer.save()
        self._handle_gallery(collection)
        # Clear prefetch cache so the response serializer fetches the updated gallery
        if hasattr(collection, '_prefetched_objects_cache'):
            collection._prefetched_objects_cache = {}

    def perform_update(self, serializer):
        collection = serializer.save()
        self._handle_gallery(collection)
        # Clear prefetch cache so the response serializer fetches the updated gallery
        if hasattr(collection, '_prefetched_objects_cache'):
            collection._prefetched_objects_cache = {}

    def _handle_gallery(self, collection):
        import logging
        logger = logging.getLogger(__name__)
        from .models import CollectionImage

        # ── Manifest-based protocol ─────────────────────────────────────
        # The frontend sends:
        #   gallery_count          – total number of gallery slots
        #   gallery_type_N         – 'existing' | 'new'
        #   gallery_existing_id_N  – PK of an existing CollectionImage (when type=existing)
        #   gallery_image_N        – uploaded File (when type=new)
        #   gallery_caption_N      – caption string
        #   gallery_order_N        – display order int
        #
        # If gallery_count is present we use the manifest. Otherwise we
        # fall back to the legacy simple list upload for backward compat.
        # ────────────────────────────────────────────────────────────────

        gallery_count_raw = self.request.data.get('gallery_count')

        if gallery_count_raw is not None:
            # ── Manifest mode ───────────────────────────────────────────
            try:
                gallery_count = int(gallery_count_raw)
            except (ValueError, TypeError):
                gallery_count = 0

            keep_ids = set()   # existing CollectionImage PKs to retain
            new_items = []     # (File, caption, order) tuples to create

            for i in range(gallery_count):
                item_type = self.request.data.get(f'gallery_type_{i}', 'new')
                caption = self.request.data.get(f'gallery_caption_{i}', '')
                try:
                    order_val = int(self.request.data.get(f'gallery_order_{i}', i))
                except (ValueError, TypeError):
                    order_val = i

                if item_type == 'existing':
                    existing_id = self.request.data.get(f'gallery_existing_id_{i}')
                    if existing_id:
                        try:
                            eid = int(existing_id)
                            keep_ids.add(eid)
                            # Update caption / order on retained images
                            CollectionImage.objects.filter(
                                pk=eid, collection=collection
                            ).update(caption=caption, order=order_val)
                        except (ValueError, TypeError):
                            pass
                else:
                    img = self.request.FILES.get(f'gallery_image_{i}')
                    if img:
                        new_items.append((img, caption, order_val))

            # Delete gallery images that the user removed (not in keep_ids)
            removed = collection.gallery.exclude(pk__in=keep_ids)
            removed_count = removed.count()
            removed.delete()

            # Create newly-uploaded images
            for img, caption, order_val in new_items:
                CollectionImage.objects.create(
                    collection=collection,
                    image=img,
                    caption=caption,
                    order=order_val,
                )

            logger.info(
                f"[AdminCollection] Gallery sync for collection {collection.id}: "
                f"kept={len(keep_ids)}, new={len(new_items)}, removed={removed_count}"
            )
            return  # done — skip legacy fallback

        # ── Legacy fallback: simple list upload ─────────────────────────
        gallery_images = self.request.FILES.getlist('gallery_images')
        if gallery_images:
            logger.info(f"[AdminCollection] Legacy list upload: {len(gallery_images)} images for collection {collection.id}")
            collection.gallery.all().delete()
            for idx, img in enumerate(gallery_images):
                caption = self.request.data.get(f'gallery_caption_{idx}', '')
                try:
                    order_val = int(self.request.data.get(f'gallery_order_{idx}', idx))
                except (ValueError, TypeError):
                    order_val = idx
                CollectionImage.objects.create(
                    collection=collection,
                    image=img,
                    caption=caption,
                    order=order_val,
                )

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
    serializer_class = AdminBrandSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_create(self, serializer):
        brand = serializer.save()
        self._handle_gallery(brand)
        if hasattr(brand, '_prefetched_objects_cache'):
            brand._prefetched_objects_cache = {}

    def perform_update(self, serializer):
        brand = serializer.save()
        self._handle_gallery(brand)
        if hasattr(brand, '_prefetched_objects_cache'):
            brand._prefetched_objects_cache = {}

    def _handle_gallery(self, brand):
        import logging
        logger = logging.getLogger(__name__)
        from .models import BrandImage

        gallery_count_raw = self.request.data.get('gallery_count')

        if gallery_count_raw is not None:
            try:
                gallery_count = int(gallery_count_raw)
            except (ValueError, TypeError):
                gallery_count = 0

            keep_ids = set()
            new_items = []

            for i in range(gallery_count):
                item_type = self.request.data.get(f'gallery_type_{i}', 'new')
                caption = self.request.data.get(f'gallery_caption_{i}', '')
                try:
                    order_val = int(self.request.data.get(f'gallery_order_{i}', i))
                except (ValueError, TypeError):
                    order_val = i

                if item_type == 'existing':
                    existing_id = self.request.data.get(f'gallery_existing_id_{i}')
                    if existing_id:
                        try:
                            eid = int(existing_id)
                            keep_ids.add(eid)
                            BrandImage.objects.filter(
                                pk=eid, brand=brand
                            ).update(caption=caption, order=order_val)
                        except (ValueError, TypeError):
                            pass
                else:
                    img = self.request.FILES.get(f'gallery_image_{i}')
                    if img:
                        new_items.append((img, caption, order_val))

            removed = brand.gallery.exclude(pk__in=keep_ids)
            removed_count = removed.count()
            removed.delete()

            for img, caption, order_val in new_items:
                BrandImage.objects.create(
                    brand=brand,
                    image=img,
                    caption=caption,
                    order=order_val,
                )

            logger.info(
                f"[AdminBrand] Gallery sync for brand {brand.id}: "
                f"kept={len(keep_ids)}, new={len(new_items)}, removed={removed_count}"
            )
            return

        gallery_images = self.request.FILES.getlist('gallery_images')
        if gallery_images:
            logger.info(f"[AdminBrand] Legacy list upload: {len(gallery_images)} images for brand {brand.id}")
            brand.gallery.all().delete()
            for idx, img in enumerate(gallery_images):
                caption = self.request.data.get(f'gallery_caption_{idx}', '')
                try:
                    order_val = int(self.request.data.get(f'gallery_order_{idx}', idx))
                except (ValueError, TypeError):
                    order_val = idx
                BrandImage.objects.create(
                    brand=brand,
                    image=img,
                    caption=caption,
                    order=order_val,
                )

class AdminBroadcastView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        title = request.data.get('title') or request.data.get('subject')
        message = request.data.get('message') or request.data.get('content')
        recipient_type = request.data.get('recipient_type') # 'investor', 'vendor', 'broadcast_investors', 'broadcast_vendors', 'multiple'
        selected_users = request.data.get('selected_users', []) # list of user IDs
        
        if not title or not message:
            return Response({'error': 'Title and message are required.'}, status=400)
            
        from .models import AdminMessage, Notification, VendorNotification, Vendor
        from investors.models import InvestorProfile, InvestorNotification
        from .email_service import send_platform_email
        from django.db import transaction

        with transaction.atomic():
            admin_msg = AdminMessage.objects.create(
                sender=request.user,
                title=title,
                content=message,
                role_target=recipient_type or "custom"
            )

            target_users = []
            
            if recipient_type == 'broadcast_investors':
                investor_profiles = InvestorProfile.objects.all()
                for profile in investor_profiles:
                    target_users.append(profile.user)
                    InvestorNotification.objects.create(
                        investor=profile,
                        message=message,
                        type='admin_broadcast'
                    )
            elif recipient_type == 'broadcast_vendors':
                vendors = Vendor.objects.all()
                for vendor in vendors:
                    target_users.append(vendor.user)
                    VendorNotification.objects.create(
                        vendor=vendor,
                        message=message,
                        type='admin_broadcast'
                    )
            elif recipient_type == 'investor' or recipient_type == 'vendor' or recipient_type == 'multiple':
                # selected_users is a list of User IDs
                users = User.objects.filter(id__in=selected_users)
                for user in users:
                    target_users.append(user)
                    # Check if investor
                    if hasattr(user, 'investor_profile'):
                        InvestorNotification.objects.create(
                            investor=user.investor_profile,
                            message=message,
                            type='admin_message'
                        )
                    # Check if vendor
                    if hasattr(user, 'vendor_profile'):
                        VendorNotification.objects.create(
                            vendor=user.vendor_profile,
                            message=message,
                            type='admin_message'
                        )
                    # Unified notification anyway
                    Notification.objects.create(
                        user=user,
                        title=title,
                        body=message
                    )

            admin_msg.recipients.set(target_users)

        # Send emails outside of transaction
        for user in target_users:
            if user.email:
                try:
                    send_platform_email(
                        subject=title,
                        template_name="system/admin_broadcast.html",
                        context={
                            "email_subject": title,
                            "email_body": message,
                            "recipient_name": user.username
                        },
                        recipient_list=[user.email]
                    )
                except Exception as e:
                    print(f"Failed to send email to {user.email}: {e}")

        return Response({
            'message': f'Message dispatched to {len(target_users)} recipients.',
            'message_id': admin_msg.id
        })
