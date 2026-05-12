---
type: schema
model: Vendor
app: core
---

# Vendor

Vendor(id, user, brand, brand_name, commission_rate, payout_balance)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| products | `ManyToOneRel` | null | [[Product]] |
| commissions | `ManyToOneRel` | null | [[Commission]] |
| earnings | `ManyToOneRel` | null | [[VendorEarning]] |
| withdrawals | `ManyToOneRel` | null | [[WithdrawalRequest]] |
| vendor_notifications | `ManyToOneRel` | null | [[VendorNotification]] |
| id | `BigAutoField` | blank, unique |  |
| user | `OneToOneField` | unique | [[User]] |
| brand | `OneToOneField` | null, blank, unique | [[Brand]] |
| brand_name | `CharField` | - |  |
| commission_rate | `DecimalField` | - |  |
| payout_balance | `DecimalField` | - |  |
| categories | `ManyToManyField` | - | [[Category]] |
