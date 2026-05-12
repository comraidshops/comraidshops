---
type: schema
model: PlatformEvent
app: core
---

# PlatformEvent

PlatformEvent(id, event_type, metadata, user, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| event_type | `CharField` | - |  |
| metadata | `JSONField` | blank |  |
| user | `ForeignKey` | null, blank | [[User]] |
| created_at | `DateTimeField` | blank |  |
