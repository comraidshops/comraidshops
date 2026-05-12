---
type: schema
model: UserAddress
app: core
---

# UserAddress

UserAddress(id, user, full_name, phone_number, address_line1, address_line2, city, state, zip_code, country, is_default, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| user | `ForeignKey` | - | [[User]] |
| full_name | `CharField` | - |  |
| phone_number | `CharField` | - |  |
| address_line1 | `CharField` | - |  |
| address_line2 | `CharField` | blank |  |
| city | `CharField` | - |  |
| state | `CharField` | - |  |
| zip_code | `CharField` | - |  |
| country | `CharField` | - |  |
| is_default | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
