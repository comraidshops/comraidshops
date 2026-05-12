---
type: schema
model: Exhibition
app: core
---

# Exhibition

Exhibition(id, title, slug, thumbnail, is_featured, created_at, meta_title, meta_description, description, cover_image, curator_note, is_published)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| brands | `ManyToManyRel` | null | [[Brand]] |
| id | `BigAutoField` | blank, unique |  |
| title | `CharField` | - |  |
| slug | `SlugField` | unique |  |
| thumbnail | `ImageField` | null, blank |  |
| is_featured | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
| meta_title | `CharField` | null, blank |  |
| meta_description | `TextField` | null, blank |  |
| description | `TextField` | blank |  |
| cover_image | `ImageField` | null, blank |  |
| curator_note | `TextField` | blank |  |
| is_published | `BooleanField` | - |  |
| articles | `ManyToManyField` | blank | [[Article]] |
| products | `ManyToManyField` | blank | [[Product]] |
| collections | `ManyToManyField` | blank | [[Collection]] |
| magazines | `ManyToManyField` | blank | [[Magazine]] |
