---
type: schema
model: Notification
app: core
---

# Notification

Notification(id, user, title, body, is_read, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| user | `ForeignKey` | - | [[User]] |
| title | `CharField` | - |  |
| body | `TextField` | - |  |
| is_read | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
