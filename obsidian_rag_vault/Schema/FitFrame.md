---
type: schema
model: FitFrame
app: core
---

# FitFrame

FitFrame(id, title, slug, cover_image, created_by, brand, is_mixed, is_featured, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| items | `ManyToOneRel` | null | [[FitItem]] |
| saved_by_users | `ManyToOneRel` | null | [[SavedFitFrame]] |
| id | `BigAutoField` | blank, unique |  |
| title | `CharField` | - |  |
| slug | `SlugField` | unique |  |
| cover_image | `ImageField` | - |  |
| created_by | `ForeignKey` | null, blank | [[User]] |
| brand | `ForeignKey` | null, blank | [[Brand]] |
| is_mixed | `BooleanField` | - |  |
| is_featured | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
