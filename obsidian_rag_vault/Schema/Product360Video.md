---
type: schema
model: Product360Video
app: core
---

# Product360Video

Product360Video(id, product, video)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| product | `OneToOneField` | unique | [[Product]] |
| video | `FileField` | - |  |
