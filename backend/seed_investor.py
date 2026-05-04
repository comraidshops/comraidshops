import os
import django
import sys
from datetime import date, timedelta

# Setup Django environment
sys.path.append('/Users/macbook/Desktop/comraidshops/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from investors.models import InvestorProfile, InvestmentAllocation, MilestoneUpdate, InvestorUpdateFeed

User = get_user_model()

def seed_investor_data():
    # Create or get investor user
    user, created = User.objects.get_or_create(
        username='investor_demo',
        email='investor@comraidshops.art',
        defaults={
            'first_name': 'Global',
            'last_name': 'Venture Partners',
        }
    )
    if created:
        user.set_password('investor123')
        user.save()
        print(f"Created user: {user.username}")

    # Create Investor Profile
    profile, created = InvestorProfile.objects.get_or_create(
        user=user,
        defaults={
            'equity_percentage': 12.5,
            'total_investment': 250000.00,
            'investment_date': date(2025, 6, 1),
            'status': 'active',
            'company_valuation_snapshot': 2000000.00
        }
    )
    if created:
        print("Created Investor Profile")

    # Create Allocations
    allocations = [
        ('development', 45.0, 'Scaling backend infrastructure and implementing AR features for luxury preview.'),
        ('marketing', 25.0, 'Global brand awareness campaign and influencer partnerships in the fashion space.'),
        ('operations', 20.0, 'Expanding the curation team and warehouse logistics in Lagos and London.'),
        ('infrastructure', 10.0, 'Security auditing and zero-knowledge proof implementation for private transactions.'),
    ]
    for cat, perc, logs in allocations:
        InvestmentAllocation.objects.get_or_create(
            category=cat,
            defaults={
                'allocation_percentage': perc,
                'description_logs': logs
            }
        )
    print("Created Investment Allocations")

    # Create Milestones
    milestones = [
        ('Platform Alpha Launch', 'completed', date(2025, 9, 15), 'Initial release with 10 foundation brands.'),
        ('Mobile App (iOS/Android)', 'ongoing', date(2026, 6, 30), 'Native performance with full AR wardrobe integration.'),
        ('European Market Entry', 'planned', date(2026, 12, 1), 'Logistics hub opening in Paris.'),
    ]
    for title, status, dt, desc in milestones:
        MilestoneUpdate.objects.get_or_create(
            title=title,
            defaults={
                'status': status,
                'date': dt,
                'description': desc
            }
        )
    print("Created Milestones")

    # Create Update Feed
    updates = [
        ('Q1 Strategic Growth Report', 'Platform Update', 'We have exceeded our GMV targets by 15% this quarter.'),
        ('Tech Stack Migration Complete', 'Dev Log', 'Backend now fully running on high-availability clusters.'),
        ('New Partnership: LVMH Archive', 'Strategic Note', 'Exclusive access secured for 50 vintage pieces.'),
    ]
    for title, cat, content in updates:
        InvestorUpdateFeed.objects.get_or_create(
            title=title,
            defaults={
                'category': cat,
                'content': content
            }
        )
    print("Created Update Feed")

if __name__ == '__main__':
    seed_investor_data()
