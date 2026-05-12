---
type: schema
model: GlobalCommission
app: core
---

# GlobalCommission

GlobalCommission(id, rate, is_active, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| rate | `DecimalField` | - |  |
| is_active | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
