from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestorDashboardView, InvestorMilestoneViewSet, 
    InvestorUpdateFeedViewSet, InvestorLoginView
)

router = DefaultRouter()
router.register(r'milestones', InvestorMilestoneViewSet, basename='investor-milestone')
router.register(r'updates', InvestorUpdateFeedViewSet, basename='investor-update')

urlpatterns = [
    path('login/', InvestorLoginView.as_view(), name='investor-login'),
    path('dashboard/', InvestorDashboardView.as_view(), name='investor-dashboard'),
    path('', include(router.urls)),
]
