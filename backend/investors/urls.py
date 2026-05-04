from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvestorDashboardView, InvestorMilestoneViewSet, 
    InvestorUpdateFeedViewSet, InvestorLoginView, InvestorGoogleLogin
)

router = DefaultRouter()
router.register(r'milestones', InvestorMilestoneViewSet, basename='investor-milestone')
router.register(r'updates', InvestorUpdateFeedViewSet, basename='investor-update')

from django.http import HttpResponse

urlpatterns = [
    path('ping/', lambda r: HttpResponse('pong')),
    path('login/', InvestorLoginView.as_view(), name='investor-login'),
    path('login/google/', InvestorGoogleLogin.as_view(), name='investor-google-login'),
    path('dashboard/', InvestorDashboardView.as_view(), name='investor-dashboard'),
    path('', include(router.urls)),
]
