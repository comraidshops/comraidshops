from django.contrib import admin
from .models import InvestorProfile, InvestmentAllocation, MilestoneUpdate, InvestorUpdateFeed

@admin.register(InvestorProfile)
class InvestorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'equity_percentage', 'total_investment', 'status', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    list_filter = ('status',)

@admin.register(InvestmentAllocation)
class InvestmentAllocationAdmin(admin.ModelAdmin):
    list_display = ('category', 'allocation_percentage', 'profile')
    list_filter = ('category',)

@admin.register(MilestoneUpdate)
class MilestoneUpdateAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'date', 'order')
    list_filter = ('status',)
    ordering = ('date', 'order')

@admin.register(InvestorUpdateFeed)
class InvestorUpdateFeedAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'created_at', 'is_published')
    list_filter = ('category', 'is_published')
    search_fields = ('title', 'content')
