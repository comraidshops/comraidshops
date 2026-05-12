---
type: schema
model: Article
app: core
---

# Article

Article(id, magazine, title, slug, content, image, video_url, video_file, video_provider, video_thumbnail, created_at, updated_at)

## Fields

| Field Name | Type | Properties | Links To |
|------------|------|------------|----------|
| linked_in_magazines | `ManyToManyRel` | null | [[Magazine]] |
| exhibitions | `ManyToManyRel` | null | [[Exhibition]] |
| id | `BigAutoField` | blank, unique |  |
| magazine | `ForeignKey` | null, blank | [[Magazine]] |
| title | `CharField` | blank |  |
| slug | `SlugField` | blank, unique |  |
| content | `TextField` | blank |  |
| image | `ImageField` | null, blank |  |
| video_url | `URLField` | null, blank |  |
| video_file | `FileField` | null, blank |  |
| video_provider | `CharField` | null, blank |  |
| video_thumbnail | `URLField` | null, blank |  |
| created_at | `DateTimeField` | blank |  |
| updated_at | `DateTimeField` | blank |  |
| products | `ManyToManyField` | blank | [[Product]] |
| likes | `ManyToManyField` | blank | [[User]] |
