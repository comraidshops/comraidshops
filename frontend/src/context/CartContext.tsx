'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNotification } from './NotificationContext';

export interface CartItem {
    id: string; // Product ID
    variant: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    slug: string;
    stock?: number;
    vendor?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string, variant: string) => void;
    updateQuantity: (id: string, variant: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isMounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Read from localStorage on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            try {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    setItems(JSON.parse(savedCart));
                }
            } catch {
                // ignore
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Save cart to local storage on change
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isMounted]);

    const { notify } = useNotification();
    const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
        const existing = items.find(
            (item) => item.id === newItem.id && item.variant === newItem.variant
        );

        if (existing) {
            if (existing.stock !== undefined && existing.quantity >= existing.stock) {
                notify('error', 'Inventory Limit', `Cannot add more ${newItem.name}. Only ${existing.stock} in stock.`);
                return;
            }
            notify('success', 'Quantity Updated', `Updated ${newItem.name} quantity in cart`);
        } else {
            notify('success', 'Added to Bag', `Added ${newItem.name} to cart`);
        }

        setItems((prev) => {
            const isExisting = prev.find(
                (item) => item.id === newItem.id && item.variant === newItem.variant
            );
            if (isExisting) {
                return prev.map((item) =>
                    item.id === newItem.id && item.variant === newItem.variant
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    }, [notify, items]);

    const removeItem = useCallback((id: string, variant: string) => {
        setItems((prev) => prev.filter((item) => !(item.id === id && item.variant === variant)));
    }, []);

    const updateQuantity = useCallback((id: string, variant: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) => prev.map((item) => {
            if (item.id === id && item.variant === variant) {
                const maxQty = item.stock !== undefined ? item.stock : Infinity;
                if (quantity > maxQty) {
                    notify('error', 'Inventory Limit', `Cannot exceed available stock of ${maxQty}.`);
                    return { ...item, quantity: maxQty };
                }
                return { ...item, quantity };
            }
            return item;
        }));
    }, [notify]);

    const clearCart = useCallback(() => setItems([]), []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal, isMounted }}>
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
