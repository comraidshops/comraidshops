---
type: schema
model: ProductImage
app: core
---

# ProductImage

ProductImage(id, product, image, is_primary, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| product | `ForeignKey` | - | [[Product]] |
| image | `ImageField` | - |  |
| is_primary | `BooleanField` | - |  |
| order | `PositiveIntegerField` | - |  |
