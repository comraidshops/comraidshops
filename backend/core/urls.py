from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet, CategoryViewSet, ProductViewSet, VendorViewSet, 
    OrderViewSet, VendorProductViewSet, VendorDashboardAPIView, CollectionViewSet,
    MagazineViewSet, ExhibitionViewSet,
    VendorOrderViewSet, VendorEarningViewSet, VendorWithdrawalViewSet,
    VendorNotificationViewSet, VendorSettingsView, VendorCommunityView,
    InitializePaymentView, PaystackWebhookView,
    RegisterView, ProfileView, AddressViewSet, SavedCardViewSet,
    UserNotificationViewSet, ChangePasswordView
)

router = DefaultRouter()
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'collections', CollectionViewSet)
router.register(r'magazines', MagazineViewSet)
router.register(r'exhibitions', ExhibitionViewSet)
router.register(r'products', ProductViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'saved-cards', SavedCardViewSet, basename='saved-card')
router.register(r'user/notifications', UserNotificationViewSet, basename='user-notification')

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/profile/', ProfileView.as_view(), name='user-profile'),
    path('user/change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    path('paystack/initialize/', InitializePaymentView.as_view(), name='paystack-initialize'),
    path('paystack/webhook/', PaystackWebhookView.as_view(), name='paystack-webhook'),
    path('vendor/dashboard/', VendorDashboardAPIView.as_view(), name='vendor-dashboard'),
    path('vendor/products/', VendorProductViewSet.as_view({'get': 'list'}), name='vendor-products-list'),
    path('vendor/products/create/', VendorProductViewSet.as_view({'post': 'create'}), name='vendor-products-create'),
    path('vendor/products/<int:pk>/', VendorProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='vendor-products-detail'),
    path('vendor/orders/', VendorOrderViewSet.as_view({'get': 'list'}), name='vendor-orders-list'),
    path('vendor/orders/<int:pk>/', VendorOrderViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='vendor-orders-detail'),
    path('vendor/earnings/', VendorEarningViewSet.as_view({'get': 'list'}), name='vendor-earnings-list'),
    path('vendor/withdrawals/', VendorWithdrawalViewSet.as_view({'get': 'list', 'post': 'create'}), name='vendor-withdrawals-list'),
    path('vendor/notifications/', VendorNotificationViewSet.as_view({'get': 'list'}), name='vendor-notifications-list'),
    path('vendor/notifications/<int:pk>/mark_read/', VendorNotificationViewSet.as_view({'post': 'mark_read'}), name='vendor-notifications-mark-read'),
    path('vendor/notifications/mark_all_read/', VendorNotificationViewSet.as_view({'post': 'mark_all_read'}), name='vendor-notifications-mark-all-read'),
    path('vendor/settings/', VendorSettingsView.as_view(), name='vendor-settings'),
    path('vendor/community/', VendorCommunityView.as_view(), name='vendor-community'),
]
