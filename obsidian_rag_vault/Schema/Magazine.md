---
type: schema
model: Magazine
app: core
---

# Magazine

Magazine(id, title, slug, description, excerpt, thumbnail, is_featured, created_at, meta_title, meta_description)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| articles | `ManyToOneRel` | null | [[Article]] |
| exhibitions | `ManyToManyRel` | null | [[Exhibition]] |
| brands | `ManyToManyRel` | null | [[Brand]] |
| id | `BigAutoField` | blank, unique |  |
| title | `CharField` | - |  |
| slug | `SlugField` | unique |  |
| description | `TextField` | blank |  |
| excerpt | `TextField` | blank |  |
| thumbnail | `ImageField` | null, blank |  |
| is_featured | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
| meta_title | `CharField` | null, blank |  |
| meta_description | `TextField` | null, blank |  |
| linked_articles | `ManyToManyField` | blank | [[Article]] |
