from django.db import models
from django.conf import settings

class InvestorProfile(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('exited', 'Exited'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investor_profile')
    equity_percentage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Investor's equity stake in percentage")
    total_investment = models.DecimalField(max_digits=15, decimal_places=2, help_text="Total amount invested")
    investment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    company_valuation_snapshot = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Company valuation at the time of snapshot")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Investor: {self.user.get_full_name() or self.user.username}"

class InvestmentAllocation(models.Model):
    CATEGORY_CHOICES = (
        ('development', 'Development'),
        ('marketing', 'Marketing'),
        ('operations', 'Operations'),
        ('infrastructure', 'Infrastructure/Tools'),
    )
    profile = models.ForeignKey(InvestorProfile, on_delete=models.CASCADE, related_name='allocations', null=True, blank=True, help_text="Optional: link to specific investor if needed, or leave blank for global transparency")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    allocation_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    description_logs = models.TextField(help_text="Detailed logs of how capital was used in this category")
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.allocation_percentage}%"

class MilestoneUpdate(models.Model):
    STATUS_CHOICES = (
        ('completed', 'Completed'),
        ('ongoing', 'Ongoing'),
        ('planned', 'Planned'),
    )
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    date = models.DateField()
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['date', 'order']

    def __str__(self):
        return self.title

class InvestorUpdateFeed(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, blank=True, help_text="e.g. Platform Update, Dev Log, Strategic Note")
    created_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class InvestorNotification(models.Model):
    investor = models.ForeignKey(InvestorProfile, on_delete=models.CASCADE, related_name='investor_notifications')
    message = models.TextField()
    type = models.CharField(max_length=50)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.investor.user.username}: {self.type}"
