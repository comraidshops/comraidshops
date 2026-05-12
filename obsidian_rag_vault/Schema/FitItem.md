---
type: schema
model: FitItem
app: core
---

# FitItem

FitItem(id, fit, product, label, order)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| fit | `ForeignKey` | - | [[FitFrame]] |
| product | `ForeignKey` | - | [[Product]] |
| label | `CharField` | - |  |
| order | `IntegerField` | - |  |
