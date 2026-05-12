---
type: schema
model: VendorEarning
app: core
---

# VendorEarning

VendorEarning(id, vendor, order, gross_amount, commission_amount, net_amount, status, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| vendor | `ForeignKey` | - | [[Vendor]] |
| order | `ForeignKey` | - | [[Order]] |
| gross_amount | `DecimalField` | - |  |
| commission_amount | `DecimalField` | - |  |
| net_amount | `DecimalField` | - |  |
| status | `CharField` | - |  |
| created_at | `DateTimeField` | blank |  |
