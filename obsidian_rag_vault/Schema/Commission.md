---
type: schema
model: Commission
app: core
---

# Commission

Commission(id, vendor, order, product, commission_rate, commission_amount, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| vendor | `ForeignKey` | - | [[Vendor]] |
| order | `ForeignKey` | - | [[Order]] |
| product | `ForeignKey` | - | [[Product]] |
| commission_rate | `DecimalField` | - |  |
| commission_amount | `DecimalField` | - |  |
| created_at | `DateTimeField` | blank |  |
