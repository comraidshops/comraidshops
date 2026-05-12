---
type: schema
model: Product
app: core
---

# Product

Product(id, vendor, category, name, slug, description, short_description, story, hero_video, editorial_quote, materials, care_instructions, origin_country, fit, weight, price, stock, image, is_featured, status, created_at, updated_at, meta_title, meta_description)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| featured_in_articles | `ManyToManyRel` | null | [[Article]] |
| exhibitions | `ManyToManyRel` | null | [[Exhibition]] |
| variants | `ManyToOneRel` | null | [[ProductVariant]] |
| orderitem | `ManyToOneRel` | null | [[OrderItem]] |
| images | `ManyToOneRel` | null | [[ProductImage]] |
| video_360 | `OneToOneRel` | null | [[Product360Video]] |
| features | `ManyToOneRel` | null | [[ProductFeature]] |
| specifications | `ManyToOneRel` | null | [[ProductSpecification]] |
| commission | `ManyToOneRel` | null | [[Commission]] |
| fit_items | `ManyToOneRel` | null | [[FitItem]] |
| id | `BigAutoField` | blank, unique |  |
| vendor | `ForeignKey` | - | [[Vendor]] |
| category | `ForeignKey` | null | [[Category]] |
| name | `CharField` | - |  |
| slug | `SlugField` | blank, unique |  |
| description | `TextField` | - |  |
| short_description | `CharField` | blank |  |
| story | `TextField` | blank |  |
| hero_video | `URLField` | blank |  |
| editorial_quote | `CharField` | blank |  |
| materials | `CharField` | blank |  |
| care_instructions | `TextField` | blank |  |
| origin_country | `CharField` | blank |  |
| fit | `CharField` | blank |  |
| weight | `CharField` | blank |  |
| price | `DecimalField` | - |  |
| stock | `PositiveIntegerField` | - |  |
| image | `ImageField` | null, blank |  |
| is_featured | `BooleanField` | - |  |
| status | `CharField` | - |  |
| created_at | `DateTimeField` | blank |  |
| updated_at | `DateTimeField` | blank |  |
| meta_title | `CharField` | null, blank |  |
| meta_description | `TextField` | null, blank |  |
| collections | `ManyToManyField` | blank | [[Collection]] |
