from rest_framework import viewsets, permissions, status, views, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import models
from django.conf import settings
from decouple import config
from .models import InvestorProfile, InvestmentAllocation, MilestoneUpdate, InvestorUpdateFeed
from .serializers import (
    InvestorProfileSerializer, MilestoneUpdateSerializer, 
    InvestorUpdateFeedSerializer, InvestmentAllocationSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class IsInvestor(permissions.BasePermission):
    """
    Custom permission to only allow investors to access the view.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'investor_profile'))

class InvestorDashboardView(views.APIView):
    permission_classes = [IsInvestor]

    def get(self, request):
        profile = request.user.investor_profile
        serializer = InvestorProfileSerializer(profile)
        
        # Get global allocations if any (where profile is null) or profile-specific ones
        allocations = InvestmentAllocation.objects.filter(models.Q(profile=profile) | models.Q(profile__isnull=True))
        allocation_serializer = InvestmentAllocationSerializer(allocations, many=True)
        
        # Get milestones
        milestones = MilestoneUpdate.objects.all()
        milestone_serializer = MilestoneUpdateSerializer(milestones, many=True)
        
        # Get latest updates
        updates = InvestorUpdateFeed.objects.filter(is_published=True)[:5]
        update_serializer = InvestorUpdateFeedSerializer(updates, many=True)
        
        return Response({
            'profile': serializer.data,
            'allocations': allocation_serializer.data,
            'milestones': milestone_serializer.data,
            'latest_updates': update_serializer.data,
            'company_valuation': profile.company_valuation_snapshot,
            'equity_value_indicator': (profile.equity_percentage / 100) * (profile.company_valuation_snapshot or 0)
        })

class InvestorMilestoneViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsInvestor]
    queryset = MilestoneUpdate.objects.all()
    serializer_class = MilestoneUpdateSerializer

class InvestorUpdateFeedViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsInvestor]
    queryset = InvestorUpdateFeed.objects.filter(is_published=True)
    serializer_class = InvestorUpdateFeedSerializer

class InvestorLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not hasattr(self.user, 'investor_profile'):
            raise serializers.ValidationError("This account does not have investor access.")
        return data

class InvestorLoginView(TokenObtainPairView):
    serializer_class = InvestorLoginSerializer

class InvestorGoogleLogin(views.APIView):
    """
    Self-contained Google OAuth2 login for investors.
    Similar to core GoogleLogin but strictly for investors.
    """
    permission_classes = [permissions.AllowAny]

    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({"error": "Authorization code is required."}, status=status.HTTP_400_BAD_REQUEST)

        callback_url = request.data.get('callback_url', '').strip()
        if not callback_url:
            callback_url = config("GOOGLE_OAUTH_CALLBACK_URL", default="http://localhost:3000/auth/callback").strip()

        client_id = config("GOOGLE_CLIENT_ID", default="")
        client_secret = config("GOOGLE_CLIENT_SECRET", default="")

        if not client_id or not client_secret:
            return Response({"error": "Google OAuth is not configured."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        import requests as http_requests
        token_response = http_requests.post(self.GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": callback_url,
            "grant_type": "authorization_code",
        })

        token_data = token_response.json()
        if "error" in token_data:
            return Response({"error": f"Google token exchange failed: {token_data.get('error_description', token_data['error'])}"}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data.get("access_token")
        userinfo_response = http_requests.get(self.GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        
        if userinfo_response.status_code != 200:
            return Response({"error": "Failed to fetch user info from Google."}, status=status.HTTP_400_BAD_REQUEST)

        userinfo = userinfo_response.json()
        email = userinfo.get("email")

        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email__iexact=email)
            if not hasattr(user, 'investor_profile'):
                return Response({"error": "This Google account does not have investor access."}, status=status.HTTP_403_FORBIDDEN)
            
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        except User.DoesNotExist:
            return Response({"error": "No investor account found for this email."}, status=status.HTTP_403_FORBIDDEN)
