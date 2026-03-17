from rest_framework import viewsets, permissions, generics, status
from django.db.models import Q
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
from .permissions import IsApprovedVendor, IsVendorUser
from .models import User, Vendor, Brand, Category, Product, Order, OrderItem, Notification, ProductImage, Product360Video, Collection, Magazine, Exhibition, VendorEarning, WithdrawalRequest, VendorNotification, UserAddress, SavedCard
from .serializers import (
    UserSerializer, VendorSerializer, BrandSerializer, CategorySerializer, 
    ProductSerializer, OrderSerializer, NotificationSerializer,
    VendorProductSerializer, CollectionSerializer, MagazineSerializer, ExhibitionSerializer,
    VendorOrderSerializer, VendorEarningSerializer, WithdrawalRequestSerializer, 
    VendorNotificationSerializer, VendorBrandSettingsSerializer,
    UserRegistrationSerializer, UserAddressSerializer, SavedCardSerializer, UserProfileSerializer
)

class CollectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class MagazineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Magazine.objects.all()
    def get_queryset(self):
        qs = Magazine.objects.all()
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs
    serializer_class = MagazineSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class ExhibitionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exhibition.objects.all()
    def get_queryset(self):
        qs = Exhibition.objects.all()
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs
    serializer_class = ExhibitionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    def get_queryset(self):
        qs = Brand.objects.prefetch_related(
            'gallery', 'collections', 'editorial_refs', 'exhibition_refs'
        ).all()
        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
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

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('vendor__brand').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        qs = Product.objects.select_related('vendor__brand').all()
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)

        featured = self.request.query_params.get('featured', None)
        if featured == 'true':
            qs = qs.filter(is_featured=True)

        user = self.request.user
        if user.is_staff:
            return qs
        if user.is_authenticated and hasattr(user, 'vendor_profile'):
            return qs.filter(
                Q(status='approved') |
                Q(vendor__user=user)
            )
        return qs.filter(status='approved')

class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vendor.objects.select_related('brand').all()
    serializer_class = VendorSerializer
    permission_classes = [permissions.AllowAny]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by("-created_at").prefetch_related("items__product__vendor")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

class VendorDashboardAPIView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        vendor = request.user.vendor_profile
        products = vendor.products.all()
        
        total_products = products.count()
        pending_products = products.filter(status='pending').count()
        approved_products = products.filter(status='approved').count()
        
        from .models import ProductVariant, Order, VendorNotification
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum

        total_variants = ProductVariant.objects.filter(product__vendor=vendor).count()
        
        vendor_orders = Order.objects.filter(items__product__vendor=vendor).distinct()
        total_orders = vendor_orders.count()
        orders_today = vendor_orders.filter(created_at__gte=timezone.now() - timedelta(days=1)).count()
        
        earnings_qs = vendor.earnings.all()
        total_revenue = earnings_qs.aggregate(Sum('gross_amount'))['gross_amount__sum'] or 0
        total_commission = earnings_qs.aggregate(Sum('commission_amount'))['commission_amount__sum'] or 0
        pending_payout = earnings_qs.filter(status='pending').aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        # Recent activity
        from .serializers import VendorOrderSerializer, VendorNotificationSerializer
        recent_orders = VendorOrderSerializer(vendor_orders.order_by('-created_at')[:5], many=True, context={'request': request}).data
        recent_notifications = VendorNotificationSerializer(vendor.vendor_notifications.order_by('-created_at')[:5], many=True).data
        
        return Response({
            "brand_name": vendor.brand_name,
            "total_products": total_products,
            "approved_products": approved_products,
            "pending_products": pending_products,
            "total_variants": total_variants,
            "total_orders": total_orders,
            "orders_today": orders_today,
            "total_revenue": total_revenue,
            "total_commission": total_commission,
            "commission_rate": vendor.commission_rate,
            "vendor_balance": vendor.payout_balance,
            "pending_payout": pending_payout,
            "recent_orders": recent_orders,
            "recent_notifications": recent_notifications
        })

class VendorCommunityView(APIView):
    permission_classes = [IsVendorUser]

    def get(self, request):
        return Response({
            "message": "Vendor community features coming soon.",
            "members_count": 0,
            "recent_discussions": []
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

class VendorOrderViewSet(viewsets.ModelViewSet):
    serializer_class = VendorOrderSerializer
    permission_classes = [IsVendorUser]

    def get_queryset(self):
        return Order.objects.filter(items__product__vendor=self.request.user.vendor_profile).distinct()

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get('status')
        
        # Only allow vendors to move to certain statuses for now
        allowed_statuses = ['shipped', 'completed', 'cancelled']
        if new_status not in allowed_statuses:
            return Response({"error": f"Vendors can only set status to: {', '.join(allowed_statuses)}"}, status=400)
            
        order.status = new_status
        order.save()
        
        return Response(VendorOrderSerializer(order, context={'request': request}).data)

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
        vendor = self.request.user.vendor_profile
        amount = serializer.validated_data.get('amount', 0)
        
        if amount > vendor.payout_balance:
            raise PermissionDenied("Cannot withdraw more than available balance.")
            
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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        items_data = request.data.get('items', [])
        if not items_data:
            return Response({"error": "No items in order"}, status=400)

        total_amount = 0
        order_items = []
        
        # Create order first in pending state
        order = Order.objects.create(
            customer=request.user,
            total_amount=0,
            status='pending'
        )

        for item in items_data:
            try:
                product = Product.objects.get(id=item['id'])
                qty = item.get('quantity', 1)
                price = product.price # Take current listing price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=price
                )
                total_amount += price * qty
            except Product.DoesNotExist:
                order.delete()
                return Response({"error": f"Product {item['id']} not found"}, status=404)

        order.total_amount = total_amount
        order.save()

        # Validate Email - Paystack requires customer email
        user_email = request.user.email
        if not user_email:
            return Response({
                "error": "Email is missing from your profile. Paystack requires an email to process payments."
            }, status=400)

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
                return Response({
                    "authorization_url": res_data['data']['authorization_url'],
                    "reference": res_data['data']['reference']
                })
            
            # Print for server terminal logs
            print("--- PAYSTACK ERROR ---")
            print(f"Payload: {payload}")
            print(f"Response: {res_data}")
            return Response({"error": "Paystack initialization failed", "details": res_data}, status=400)
        except Exception as e:
            print(f"--- PAYSTACK EXCEPTION ---: {str(e)}")
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
        
        # Handle Successful Payment
        if event['event'] == 'charge.success':
            order_id = event['data']['metadata'].get('order_id')
            try:
                order = Order.objects.get(id=order_id)
                if order.status == 'pending':
                    order.status = 'completed' # This triggers settle_vendor_earnings signal
                    order.save()
            except Order.DoesNotExist:
                pass
            
            # Handle "Save Card" if metadata provided
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

        return Response({"status": "success"}, status=200)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

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
