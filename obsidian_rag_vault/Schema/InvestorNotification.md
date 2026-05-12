---
type: schema
model: InvestorNotification
app: investors
---

# InvestorNotification

InvestorNotification(id, investor, message, type, read, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| investor | `ForeignKey` | - | [[InvestorProfile]] |
| message | `TextField` | - |  |
| type | `CharField` | - |  |
| read | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
