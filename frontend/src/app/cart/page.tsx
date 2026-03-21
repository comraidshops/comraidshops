'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, updateQuantity, cartTotal, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-2xl font-bold uppercase tracking-tight mb-4">Your Cart is Empty</h1>
                <p className="text-secondary mb-8">Looks like you haven&#39;t added anything yet.</p>
                <Link href="/shop" className="border-b border-primary pb-1 uppercase tracking-widest hover:text-secondary transition-colors">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-center md:text-left">
                        Shopping Cart ({items.length})
                    </h1>
                    <button 
                        onClick={() => {
                            if (confirm('Clear all items from your cart?')) {
                                clearCart();
                            }
                        }}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 hover:text-red-500 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="space-y-8">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.variant}`} className="flex gap-6 py-6 border-b border-border">
                            <div className="relative w-24 h-32 bg-secondary/10 flex-shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold uppercase tracking-tight">{item.name}</h3>
                                        <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-secondary uppercase tracking-wider mb-1">{item.vendor}</p>
                                    <p className="text-sm text-secondary mb-4">Variant: {item.variant.replace('Size: ', '')}</p>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-border">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                                                className="px-3 py-1 hover:bg-secondary/10 transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-1 text-sm font-bold min-w-[40px] text-center border-x border-border">
                                                {item.quantity}
                                            </span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                                                className="px-3 py-1 hover:bg-secondary/10 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.id, item.variant)}
                                    className="text-xs text-secondary underline uppercase tracking-wider self-start hover:text-primary"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="text-sm text-secondary max-w-xs">
                        <p>Shipping & taxes calculated at checkout.</p>
                    </div>

                    <div className="w-full md:w-auto text-right">
                        <div className="flex justify-between md:justify-end gap-12 mb-6 text-xl font-bold uppercase tracking-tight">
                            <span>Total</span>
                            <span>₦{cartTotal.toLocaleString()}</span>
                        </div>
                        <Link
                            href="/checkout"
                            className="block w-full md:w-auto bg-primary text-background px-12 py-4 text-center font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
                        >
                            Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
