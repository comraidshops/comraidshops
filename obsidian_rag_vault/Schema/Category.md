---
type: schema
model: Category
app: core
---

# Category

Category(id, name, slug)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| vendors | `ManyToManyRel` | null | [[Vendor]] |
| products | `ManyToOneRel` | null | [[Product]] |
| id | `BigAutoField` | blank, unique |  |
| name | `CharField` | - |  |
| slug | `SlugField` | blank, unique |  |
