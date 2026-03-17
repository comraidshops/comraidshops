'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CartItem {
    id: string; // Product ID
    variant: string;
    name: string;
    price: number;
    image: string;
    vendor: string;
    quantity: number;
    slug: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string, variant: string) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Lazy initializer: runs once on mount, reads from localStorage.
        // This is the idiomatic React pattern — no useEffect needed.
        if (typeof window === 'undefined') return [];
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    // Save cart to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
        setItems((prev) => {
            const existing = prev.find(
                (item) => item.id === newItem.id && item.variant === newItem.variant
            );
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id && item.variant === newItem.variant
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: string, variant: string) => {
        setItems((prev) => prev.filter((item) => !(item.id === id && item.variant === variant)));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
