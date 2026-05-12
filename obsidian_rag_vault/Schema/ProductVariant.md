---
type: schema
model: ProductVariant
app: core
---

# ProductVariant

ProductVariant(id, product, name, stock)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| product | `ForeignKey` | - | [[Product]] |
| name | `CharField` | - |  |
| stock | `PositiveIntegerField` | - |  |
