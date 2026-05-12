---
type: schema
model: SavedFitFrame
app: core
---

# SavedFitFrame

SavedFitFrame(id, user, fitframe, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| user | `ForeignKey` | - | [[User]] |
| fitframe | `ForeignKey` | - | [[FitFrame]] |
| created_at | `DateTimeField` | blank |  |
