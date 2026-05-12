---
type: schema
model: Collection
app: core
---

# Collection

Collection(id, brand, name, slug, season, description, hero_image, preview_image, is_featured, order, created_at, meta_title, meta_description)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| exhibitions | `ManyToManyRel` | null | [[Exhibition]] |
| gallery | `ManyToOneRel` | null | [[CollectionImage]] |
| products | `ManyToManyRel` | null | [[Product]] |
| id | `BigAutoField` | blank, unique |  |
| brand | `ForeignKey` | - | [[Brand]] |
| name | `CharField` | - |  |
| slug | `SlugField` | unique |  |
| season | `CharField` | blank |  |
| description | `TextField` | blank |  |
| hero_image | `ImageField` | null, blank |  |
| preview_image | `ImageField` | null, blank |  |
| is_featured | `BooleanField` | - |  |
| order | `PositiveIntegerField` | - |  |
| created_at | `DateTimeField` | blank |  |
| meta_title | `CharField` | null, blank |  |
| meta_description | `TextField` | null, blank |  |
