---
type: schema
model: InvestmentAllocation
app: investors
---

# InvestmentAllocation

InvestmentAllocation(id, profile, category, allocation_percentage, description_logs)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| profile | `ForeignKey` | null, blank | [[InvestorProfile]] |
| category | `CharField` | - |  |
| allocation_percentage | `DecimalField` | - |  |
| description_logs | `TextField` | - |  |
