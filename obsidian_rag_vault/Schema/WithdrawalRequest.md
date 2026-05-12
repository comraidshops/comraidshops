---
type: schema
model: WithdrawalRequest
app: core
---

# WithdrawalRequest

WithdrawalRequest(id, vendor, amount, bank_name, account_number, account_name, email, phone_number, status, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| vendor | `ForeignKey` | - | [[Vendor]] |
| amount | `DecimalField` | - |  |
| bank_name | `CharField` | - |  |
| account_number | `CharField` | - |  |
| account_name | `CharField` | - |  |
| email | `EmailField` | null, blank |  |
| phone_number | `CharField` | null, blank |  |
| status | `CharField` | - |  |
| created_at | `DateTimeField` | blank |  |
