---
type: schema
model: CollectionImage
app: core
---

# CollectionImage

CollectionImage(id, collection, image, caption, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| collection | `ForeignKey` | - | [[Collection]] |
| image | `ImageField` | - |  |
| caption | `CharField` | blank |  |
| order | `PositiveIntegerField` | - |  |
