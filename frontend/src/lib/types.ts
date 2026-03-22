/**
 * Shared Type Definitions for ComraidShops
 */

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
    is_vendor: boolean;
    is_customer: boolean;
    avatar?: string;
}

export interface UserProfile extends User {
    username: string;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
    meta_title?: string | null;
    meta_description?: string | null;
}

export interface Address {
    id: number;
    full_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    is_default: boolean;
}

export interface BrandImage {
    id: number;
    image: string;
    caption?: string;
    order: number;
}

export interface EditorialRef {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string | null;
}

export interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string;
    tagline?: string;
    logo?: string | null;
    hero_image: string | null;
    created_at: string;

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

    approved_product_count: number;
    total_product_count: number;
    featured_products: Product[];
    is_member?: boolean;
    community_count?: number;
    meta_title?: string | null;
    meta_description?: string | null;
}

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
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description?: string;
    story?: string;
    hero_video?: string;
    editorial_quote?: string;
    materials?: string;
    care_instructions?: string;
    origin_country?: string;
    fit?: string;
    weight?: string;
    price: string | number;
    stock: number;
    image: string;
    status: string;
    created_at: string;
    related_products?: Product[];
    vendor_name?: string;
    brand?: string | Brand;
    brand_name?: string;
    category_slug?: string;
    category?: number | string;
    is_featured?: boolean;
    variants?: ProductVariant[];
    images?: ProductImage[];
    videos?: string[];
    video_360?: string | null;
    collections?: Collection[];
    features?: ProductFeature[];
    specifications?: ProductSpecification[];
    meta_title?: string | null;
    meta_description?: string | null;
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
    meta_title?: string | null;
    meta_description?: string | null;
}

export interface Slide {
    id: number;
    image: string;
    title?: string;
    link?: string;
}

export interface Exhibition {
    id: number;
    title: string;
    slug: string;
    description?: string;
    thumbnail?: string | null;
    cover_image?: string | null;
    curator_note?: string | null;
    start_date?: string;
    end_date?: string;
    is_featured?: boolean;
    meta_title?: string | null;
    meta_description?: string | null;
    products?: Product[];
    articles?: any[];
    collections?: Collection[];
    magazines?: Magazine[];
}

export interface Magazine {
    id: number;
    title: string;
    slug: string;
    description?: string;
    excerpt?: string;
    thumbnail?: string | null;
    created_at?: string;
    meta_title?: string | null;
    meta_description?: string | null;
    article?: {
        title: string;
        slug: string;
        content?: string;
        products?: Product[];
    };
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
