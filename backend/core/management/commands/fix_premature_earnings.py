"""
Management command to fix premature VendorEarning and Commission records
that were created by the old signal logic (which fired on OrderItem creation,
before payment was confirmed).

Usage:
    python manage.py fix_premature_earnings
    python manage.py fix_premature_earnings --dry-run
    python manage.py fix_premature_earnings --reverse-payouts
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import F


class Command(BaseCommand):
    help = (
        'Reverses VendorEarning and Commission records created for orders '
        'that were never confirmed (payment_status != confirmed). '
        'Also reverses any payout_balance additions from such earnings.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without making changes.',
        )
        parser.add_argument(
            '--reverse-payouts',
            action='store_true',
            help='Also reverse payout_balance for cleared earnings from unconfirmed orders.',
        )

    def handle(self, *args, **options):
        from core.models import VendorEarning, Commission, Vendor

        dry_run = options['dry_run']
        reverse_payouts = options['reverse_payouts']

        self.stdout.write(self.style.NOTICE(
            '=== Premature Earnings Fix ===' + (' [DRY RUN]' if dry_run else '')
        ))

        # Find all earnings linked to orders that are NOT confirmed
        bad_earnings = VendorEarning.objects.filter(
            order__payment_status__in=['pending', 'paid', 'failed', 'refunded']
        ).select_related('vendor', 'order')

        bad_earning_count = bad_earnings.count()
        self.stdout.write(f'\nFound {bad_earning_count} VendorEarning records from unconfirmed orders.')

        if bad_earning_count == 0:
            self.stdout.write(self.style.SUCCESS('✓ No premature earnings found. System is clean.'))
            return

        # Detail per vendor
        for earning in bad_earnings:
            self.stdout.write(
                f'  - Earning #{earning.id}: Vendor={earning.vendor.brand_name}, '
                f'Order #{earning.order.id} (status={earning.order.payment_status}), '
                f'Net=₦{earning.net_amount:,.2f}, Cleared={earning.status == "cleared"}'
            )

        # Find bad Commission records linked to the same orders
        bad_order_ids = list(bad_earnings.values_list('order_id', flat=True).distinct())
        bad_commissions = Commission.objects.filter(order_id__in=bad_order_ids)
        bad_commission_count = bad_commissions.count()
        self.stdout.write(f'\nFound {bad_commission_count} Commission records to remove.')

        # Find cleared earnings that need payout reversal
        cleared_bad_earnings = bad_earnings.filter(status='cleared')
        cleared_count = cleared_bad_earnings.count()

        if cleared_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠️  {cleared_count} earnings have status=cleared (payout_balance was incremented).'
                )
            )
            if reverse_payouts:
                self.stdout.write('  --reverse-payouts is set: will reverse payout_balance amounts.')
            else:
                self.stdout.write(
                    '  --reverse-payouts not set: payout_balance will NOT be reversed. '
                    'Run with --reverse-payouts to also fix balances.'
                )

        if dry_run:
            self.stdout.write(self.style.WARNING(
                '\n[DRY RUN] No changes made. Run without --dry-run to apply fixes.'
            ))
            return

        # ── Apply Fixes ──────────────────────────────────────────────────────
        with transaction.atomic():
            # 1. Reverse payout_balance for cleared bad earnings
            if reverse_payouts and cleared_count > 0:
                for earning in cleared_bad_earnings:
                    Vendor.objects.filter(pk=earning.vendor_id).update(
                        payout_balance=F('payout_balance') - earning.net_amount
                    )
                    self.stdout.write(
                        f'  ↩ Reversed ₦{earning.net_amount:,.2f} from {earning.vendor.brand_name} balance.'
                    )

            # 2. Delete the bad VendorEarning records
            deleted_earnings, _ = bad_earnings.delete()

            # 3. Delete the bad Commission records
            deleted_commissions, _ = bad_commissions.delete()

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Deleted {deleted_earnings} VendorEarning records.'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'✓ Deleted {deleted_commissions} Commission records.'
        ))
        if reverse_payouts and cleared_count > 0:
            self.stdout.write(self.style.SUCCESS(
                f'✓ Reversed payout_balance for {cleared_count} cleared earnings.'
            ))

        self.stdout.write(self.style.SUCCESS('\n=== Fix Complete ==='))
