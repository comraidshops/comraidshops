export interface ProductVariant {
    id: number;
    name: string;
    stock: number;
}

export interface ProductImage {
    id: number;
    image: string;
    is_primary: boolean;
    order: number;
}

export interface ProductFeature {
    id: number;
    title: string;
    description: string;
    image: string;
    order: number;
}

export interface ProductSpecification {
    id: number;
    name: string;
    value: string;
}

export interface Product {
    id: number
    name: string
    slug: string
    description: string
    short_description?: string
    story?: string
    hero_video?: string
    editorial_quote?: string
    materials?: string
    care_instructions?: string
    origin_country?: string
    fit?: string
    weight?: string
    price: string
    stock: number
    image: string
    status: string
    created_at: string
    related_products?: Product[]
    vendor_name?: string
    brand?: Brand
    category_slug?: string
    variants?: ProductVariant[]
    images?: ProductImage[]
    videos?: string[]
    video_360?: string | null
    collections?: Collection[]
    features?: ProductFeature[]
    specifications?: ProductSpecification[]
}

export interface BrandImage {
    id: number;
    image: string;
    caption?: string;
    order: number;
}

export interface Collection {
    id: number;
    name: string;
    slug: string;
    season?: string;
    description?: string;
    hero_image?: string | null;
    products?: Product[];
    is_featured?: boolean;
    order?: number;
}

export interface EditorialRef {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string | null;
}

export interface Brand {
    id: number
    name: string
    slug: string
    description: string
    hero_image: string | null
    created_at: string

    // Luxury fields
    philosophy?: string;
    founder_name?: string;
    founder_bio?: string;
    founder_image?: string | null;
    established_year?: number | null;
    origin_country?: string;
    website?: string;
    social_links?: Record<string, string>;
    awards?: string;
    manifesto?: string;
    featured_quote?: string;
    story?: string;

    // Relationships
    gallery?: BrandImage[];
    collections?: Collection[];
    editorial_refs?: EditorialRef[];
    exhibition_refs?: EditorialRef[];

    approved_product_count: number
    total_product_count: number
    featured_products: Product[]
}
