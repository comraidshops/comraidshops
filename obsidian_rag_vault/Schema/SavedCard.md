---
type: schema
model: SavedCard
app: core
---

# SavedCard

SavedCard(id, user, authorization_code, last4, exp_month, exp_year, card_type, bank, is_default, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| user | `ForeignKey` | - | [[User]] |
| authorization_code | `CharField` | - |  |
| last4 | `CharField` | - |  |
| exp_month | `CharField` | - |  |
| exp_year | `CharField` | - |  |
| card_type | `CharField` | - |  |
| bank | `CharField` | blank |  |
| is_default | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
