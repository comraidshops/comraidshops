from rest_framework import serializers
from .models import InvestorProfile, InvestmentAllocation, MilestoneUpdate, InvestorUpdateFeed, InvestorNotification
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class InvestmentAllocationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = InvestmentAllocation
        fields = ['id', 'category', 'category_display', 'allocation_percentage', 'description_logs']

class InvestorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    allocations = InvestmentAllocationSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = InvestorProfile
        fields = [
            'id', 'user', 'equity_percentage', 'total_investment', 
            'investment_date', 'status', 'status_display', 
            'company_valuation_snapshot', 'allocations'
        ]

class MilestoneUpdateSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MilestoneUpdate
        fields = ['id', 'title', 'status', 'status_display', 'date', 'description', 'order']

class InvestorUpdateFeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorUpdateFeed
        fields = ['id', 'title', 'content', 'category', 'created_at']

class InvestorNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestorNotification
        fields = ['id', 'message', 'type', 'read', 'created_at']
