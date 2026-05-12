---
type: schema
model: HomepageSlide
app: core
---

# HomepageSlide

HomepageSlide(id, image, order, is_active, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| image | `ImageField` | - |  |
| order | `PositiveIntegerField` | - |  |
| is_active | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
