---
type: schema
model: OrderItem
app: core
---

# OrderItem

OrderItem(id, order, product, quantity, price, status)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| order | `ForeignKey` | - | [[Order]] |
| product | `ForeignKey` | - | [[Product]] |
| quantity | `PositiveIntegerField` | - |  |
| price | `DecimalField` | - |  |
| status | `CharField` | - |  |
