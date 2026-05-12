---
type: schema
model: VendorNotification
app: core
---

# VendorNotification

VendorNotification(id, vendor, message, type, read, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| vendor | `ForeignKey` | - | [[Vendor]] |
| message | `TextField` | - |  |
| type | `CharField` | - |  |
| read | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
