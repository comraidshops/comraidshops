---
type: schema
model: AdminMessage
app: core
---

# AdminMessage

AdminMessage(id, sender, title, content, role_target, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| sender | `ForeignKey` | - | [[User]] |
| title | `CharField` | - |  |
| content | `TextField` | - |  |
| role_target | `CharField` | blank |  |
| created_at | `DateTimeField` | blank |  |
| recipients | `ManyToManyField` | - | [[User]] |
