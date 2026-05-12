---
type: schema
model: ProductSpecification
app: core
---

# ProductSpecification

ProductSpecification(id, product, name, value)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| product | `ForeignKey` | - | [[Product]] |
| name | `CharField` | - |  |
| value | `CharField` | - |  |
