from rest_framework import viewsets, permissions, status, views, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import models
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
