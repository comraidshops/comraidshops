export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_vendor: boolean;
    is_superuser: boolean;
}

export interface OrderItem {
    id: number;
    product_name: string;
    product_image: string | null;
    product_slug?: string;
    brand_name?: string;
    quantity: number;
    price: string;
}

export interface Order {
    id: number;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: string;
    created_at: string;
    items?: OrderItem[];
}

export interface Notification {
    id: number;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

export interface CommunityMember {
    id: number;
    user: number;
    username: string;
    brand: number;
    joined_at: string;
}
