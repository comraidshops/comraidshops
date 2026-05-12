---
type: schema
model: BrandCommunityMember
app: core
---

# BrandCommunityMember

BrandCommunityMember(id, user, brand, joined_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| id | `BigAutoField` | blank, unique |  |
| user | `ForeignKey` | - | [[User]] |
| brand | `ForeignKey` | - | [[Brand]] |
| joined_at | `DateTimeField` | blank |  |
