---
type: schema
model: User
app: core
---

# User

User(id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined, is_vendor, is_vendor_approved, is_customer)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| logentry | `ManyToOneRel` | null | [[LogEntry]] |
| auth_token | `OneToOneRel` | null | [[Token]] |
| liked_articles | `ManyToManyRel` | null | [[Article]] |
| vendor_profile | `OneToOneRel` | null | [[Vendor]] |
| orders | `ManyToOneRel` | null | [[Order]] |
| notifications | `ManyToOneRel` | null | [[Notification]] |
| sent_admin_messages | `ManyToOneRel` | null | [[AdminMessage]] |
| received_admin_messages | `ManyToManyRel` | null | [[AdminMessage]] |
| addresses | `ManyToOneRel` | null | [[UserAddress]] |
| saved_cards | `ManyToOneRel` | null | [[SavedCard]] |
| created_fits | `ManyToOneRel` | null | [[FitFrame]] |
| saved_fits | `ManyToOneRel` | null | [[SavedFitFrame]] |
| joined_communities | `ManyToOneRel` | null | [[BrandCommunityMember]] |
| platform_events | `ManyToOneRel` | null | [[PlatformEvent]] |
| emailaddress | `ManyToOneRel` | null | [[EmailAddress]] |
| socialaccount | `ManyToOneRel` | null | [[SocialAccount]] |
| investor_profile | `OneToOneRel` | null | [[InvestorProfile]] |
| id | `BigAutoField` | blank, unique |  |
| password | `CharField` | - |  |
| last_login | `DateTimeField` | null, blank |  |
| is_superuser | `BooleanField` | - |  |
| username | `CharField` | unique |  |
| first_name | `CharField` | blank |  |
| last_name | `CharField` | blank |  |
| email | `EmailField` | blank |  |
| is_staff | `BooleanField` | - |  |
| is_active | `BooleanField` | - |  |
| date_joined | `DateTimeField` | - |  |
| is_vendor | `BooleanField` | - |  |
| is_vendor_approved | `BooleanField` | - |  |
| is_customer | `BooleanField` | - |  |
| groups | `ManyToManyField` | blank | [[Group]] |
| user_permissions | `ManyToManyField` | blank | [[Permission]] |
