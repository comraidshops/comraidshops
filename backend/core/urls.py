from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrandViewSet, CategoryViewSet, ProductViewSet, VendorViewSet, 
    OrderViewSet, VendorProductViewSet, VendorDashboardAPIView, CollectionViewSet,
    MagazineViewSet, MagazineFeaturedView, ExhibitionViewSet, FitFrameViewSet, SavedFitFrameViewSet,
    VendorOrderViewSet, VendorEarningViewSet, VendorWithdrawalViewSet,
    VendorNotificationViewSet, VendorSettingsView, VendorCommunityView,
    VendorAnalyticsAPIView,
    InitializePaymentView, PaystackWebhookView,
    RegisterView, ProfileView, AddressViewSet, SavedCardViewSet,
    UserNotificationViewSet, ChangePasswordView, HomepageSlideViewSet,
    PasswordResetRequestView, PasswordResetConfirmView, VerifyEmailRequestView,
    GoogleLogin
)

router = DefaultRouter()
router.register(r'brands', BrandViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'collections', CollectionViewSet)
router.register(r'magazines', MagazineViewSet)
router.register(r'exhibitions', ExhibitionViewSet)
router.register(r'fitframes', FitFrameViewSet, basename='fitframe')
router.register(r'products', ProductViewSet)
router.register(r'vendors', VendorViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'saved-cards', SavedCardViewSet, basename='saved-card')
router.register(r'saved-fits', SavedFitFrameViewSet, basename='saved-fit')
router.register(r'user/notifications', UserNotificationViewSet, basename='user-notification')
router.register(r'slides', HomepageSlideViewSet)


from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/password-reset-request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/verify-email-request/', VerifyEmailRequestView.as_view(), name='verify_email_request'),
    path('user/profile/', ProfileView.as_view(), name='user-profile'),
    path('user/change-password/', ChangePasswordView.as_view(), name='user-change-password'),
    path('paystack/initialize/', InitializePaymentView.as_view(), name='paystack-initialize'),
    path('paystack/webhook/', PaystackWebhookView.as_view(), name='paystack-webhook'),
    path('magazine/featured/', MagazineFeaturedView.as_view(), name='magazine-featured'),
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
    path('vendor/analytics/', VendorAnalyticsAPIView.as_view(), name='vendor-analytics'),
    
    # --- Administrative Endpoints ---
    path('admin/stats/', include([
        path('', include([
            path('', include([
                # Placeholder for complex nested paths if needed
            ])),
        ])),
    ])),
]

# Create a separate router for admin endpoints to keep it clean
from .admin_views import (
    AdminStatsView, AdminUserViewSet, AdminVendorViewSet, 
    AdminProductViewSet, AdminOrderViewSet, AdminWithdrawalViewSet,
    AdminEarningViewSet, AdminCommissionViewSet, AdminMagazineViewSet,
    AdminArticleViewSet, AdminExhibitionViewSet, AdminCollectionViewSet,
    AdminHomepageSlideViewSet, AdminFitFrameViewSet, AdminBrandViewSet,
    AdminBroadcastView, AdminCategoryViewSet
)

admin_router = DefaultRouter()
admin_router.register(r'users', AdminUserViewSet, basename='admin-user')
admin_router.register(r'vendors', AdminVendorViewSet, basename='admin-vendor')
admin_router.register(r'categories', AdminCategoryViewSet, basename='admin-category')
admin_router.register(r'products', AdminProductViewSet, basename='admin-product')
admin_router.register(r'orders', AdminOrderViewSet, basename='admin-order')
admin_router.register(r'withdrawals', AdminWithdrawalViewSet, basename='admin-withdrawal')
admin_router.register(r'earnings', AdminEarningViewSet, basename='admin-earning')
admin_router.register(r'commissions', AdminCommissionViewSet, basename='admin-commission')
admin_router.register(r'magazines', AdminMagazineViewSet, basename='admin-magazine')
admin_router.register(r'articles', AdminArticleViewSet, basename='admin-article')
admin_router.register(r'exhibitions', AdminExhibitionViewSet, basename='admin-exhibition')
admin_router.register(r'collections', AdminCollectionViewSet, basename='admin-collection')
admin_router.register(r'slides', AdminHomepageSlideViewSet, basename='admin-slide')
admin_router.register(r'fitframes', AdminFitFrameViewSet, basename='admin-fitframe')
admin_router.register(r'brands', AdminBrandViewSet, basename='admin-brand')

urlpatterns += [
    path('admin-api/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin-api/broadcast/', AdminBroadcastView.as_view(), name='admin-broadcast'),
    path('admin-api/', include(admin_router.urls)),
]
