---
type: schema
model: InvestorProfile
app: investors
---

# InvestorProfile

InvestorProfile(id, user, equity_percentage, total_investment, investment_date, status, company_valuation_snapshot, created_at, updated_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| allocations | `ManyToOneRel` | null | [[InvestmentAllocation]] |
| investor_notifications | `ManyToOneRel` | null | [[InvestorNotification]] |
| id | `BigAutoField` | blank, unique |  |
| user | `OneToOneField` | unique | [[User]] |
| equity_percentage | `DecimalField` | - |  |
| total_investment | `DecimalField` | - |  |
| investment_date | `DateField` | - |  |
| status | `CharField` | - |  |
| company_valuation_snapshot | `DecimalField` | null, blank |  |
| created_at | `DateTimeField` | blank |  |
| updated_at | `DateTimeField` | blank |  |
