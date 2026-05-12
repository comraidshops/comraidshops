---
type: schema
model: ProductFeature
app: core
---

# ProductFeature

ProductFeature(id, product, title, description, image, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| product | `ForeignKey` | - | [[Product]] |
| title | `CharField` | - |  |
| description | `TextField` | - |  |
| image | `ImageField` | - |  |
| order | `PositiveIntegerField` | - |  |
