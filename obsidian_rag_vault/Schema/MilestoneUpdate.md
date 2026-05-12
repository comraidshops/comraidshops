---
type: schema
model: MilestoneUpdate
app: investors
---

# MilestoneUpdate

MilestoneUpdate(id, title, status, date, description, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| title | `CharField` | - |  |
| status | `CharField` | - |  |
| date | `DateField` | - |  |
| description | `TextField` | - |  |
| order | `PositiveIntegerField` | - |  |
