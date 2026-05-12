---
type: schema
model: InvestorUpdateFeed
app: investors
---

# InvestorUpdateFeed

InvestorUpdateFeed(id, title, content, category, created_at, is_published)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| title | `CharField` | - |  |
| content | `TextField` | - |  |
| category | `CharField` | blank |  |
| created_at | `DateTimeField` | blank |  |
| is_published | `BooleanField` | - |  |
