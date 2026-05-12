---
type: schema
model: Brand
app: core
---

# Brand

Brand(id, name, slug, description, tagline, hero_image, preview_image, logo, meta_title, meta_description, philosophy, founder_name, founder_bio, founder_image, established_year, origin_country, website, social_links, awards, manifesto, featured_quote, story, is_featured, visibility, created_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| gallery | `ManyToOneRel` | null | [[BrandImage]] |
| collections | `ManyToOneRel` | null | [[Collection]] |
| vendor | `OneToOneRel` | null | [[Vendor]] |
| fit_frames | `ManyToOneRel` | null | [[FitFrame]] |
| community_members | `ManyToOneRel` | null | [[BrandCommunityMember]] |
| id | `BigAutoField` | blank, unique |  |
| name | `CharField` | - |  |
| slug | `SlugField` | unique |  |
| description | `TextField` | blank |  |
| tagline | `CharField` | blank |  |
| hero_image | `ImageField` | null, blank |  |
| preview_image | `ImageField` | null, blank |  |
| logo | `ImageField` | null, blank |  |
| meta_title | `CharField` | null, blank |  |
| meta_description | `TextField` | null, blank |  |
| philosophy | `TextField` | blank |  |
| founder_name | `CharField` | blank |  |
| founder_bio | `TextField` | blank |  |
| founder_image | `ImageField` | null, blank |  |
| established_year | `PositiveIntegerField` | null, blank |  |
| origin_country | `CharField` | blank |  |
| website | `URLField` | blank |  |
| social_links | `JSONField` | blank |  |
| awards | `TextField` | blank |  |
| manifesto | `TextField` | blank |  |
| featured_quote | `CharField` | blank |  |
| story | `TextField` | blank |  |
| is_featured | `BooleanField` | - |  |
| visibility | `BooleanField` | - |  |
| created_at | `DateTimeField` | blank |  |
| editorial_refs | `ManyToManyField` | blank | [[Magazine]] |
| exhibition_refs | `ManyToManyField` | blank | [[Exhibition]] |
