---
type: schema
model: Order
app: core
---

# Order

Order(id, customer, guest_email, total_amount, payment_status, paystack_reference, order_status, created_at, updated_at, shipping_full_name, shipping_phone_number, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_zip_code, shipping_country)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| items | `ManyToOneRel` | null | [[OrderItem]] |
| commissions | `ManyToOneRel` | null | [[Commission]] |
| vendor_earnings | `ManyToOneRel` | null | [[VendorEarning]] |
| id | `BigAutoField` | blank, unique |  |
| customer | `ForeignKey` | null, blank | [[User]] |
| guest_email | `EmailField` | null, blank |  |
| total_amount | `DecimalField` | - |  |
| payment_status | `CharField` | - |  |
| paystack_reference | `CharField` | null, blank |  |
| order_status | `CharField` | - |  |
| created_at | `DateTimeField` | blank |  |
| updated_at | `DateTimeField` | blank |  |
| shipping_full_name | `CharField` | null, blank |  |
| shipping_phone_number | `CharField` | null, blank |  |
| shipping_address_line1 | `CharField` | null, blank |  |
| shipping_address_line2 | `CharField` | null, blank |  |
| shipping_city | `CharField` | null, blank |  |
| shipping_state | `CharField` | null, blank |  |
| shipping_zip_code | `CharField` | null, blank |  |
| shipping_country | `CharField` | null, blank |  |
