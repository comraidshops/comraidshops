---
type: schema
model: BrandImage
app: core
---

# BrandImage

BrandImage(id, brand, image, caption, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| brand | `ForeignKey` | - | [[Brand]] |
| image | `ImageField` | - |  |
| caption | `CharField` | blank |  |
| order | `PositiveIntegerField` | - |  |
