'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, CreditCard, Plus } from 'lucide-react';
import { API_BASE_URL, initializePayment } from '@/lib/api';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [saveCard, setSaveCard] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                const res = await fetch(`${API_BASE_URL}/addresses/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAddresses(data);
                    const def = data.find((a: any) => a.is_default);
                    if (def) setSelectedAddress(def.id);
                }
            }
        };

        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'success') {
            setStep(3);
            // Cart is cleared here because Paystack has confirmed the payment
            // and the user has been redirected back to this page with ?status=success.
            // This is the only safe place to clear the cart.
            clearCart();
        } else {
            fetchAddresses();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array: run once on mount. clearCart is stable from context but
             // including it would cause an infinite loop as ctx functions re-create.

    const runDiagnostic = async () => {
        console.log("--- STARTING CONNECTIVITY DIAGNOSTIC ---");
        const testUrl = `${API_BASE_URL}/products/`;
        console.log(`Your Location: ${window.location.origin}`);
        console.log(`Backend Target: ${API_BASE_URL}`);
        console.log(`Full Test URL: ${testUrl}`);
        
        try {
            const start = Date.now();
            // Explicitly use the fetch API with manual mode to see network state
            const res = await fetch(testUrl, { 
                method: 'GET', 
                mode: 'cors',
                credentials: 'omit' // Simplify for diagnostic
            });
            const end = Date.now();
            console.log(`Diagnostic Response Status: ${res.status} (${end - start}ms)`);
            const text = await res.text();
            console.log("Diagnostic Response Body Preview:", text.substring(0, 100));
            alert("Connection Successful! Your browser can reach the backend.");
        } catch (err: any) {
            console.error("--- DIAGNOSTIC FAILURE ---");
            console.error("Error Name:", err.name);
            console.error("Error Message:", err.message);
            
            if (err.name === 'TypeError' && err.message === 'Load failed') {
                console.error("POSSIBLE CAUSE: The backend is NOT listening on the network IP, or there is a CORS/Mixed Content block.");
            }
            
            console.error("Full Error Object:", err);
            alert(`Connection Failed: ${err.name} - ${err.message}. \n\nCheck console for "DIAGNOSTIC FAILURE" details.`);
        }
        console.log("--- END DIAGNOSTIC ---");
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            console.log("Attempting Checkout via safeFetch...");

            const paymentData = await initializePayment({
                items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                redirect_url: `${window.location.origin}/checkout?status=success`,
                save_card: saveCard,
                address_id: selectedAddress
            });

            console.log("Paystack Init Response:", paymentData);

            if (paymentData.authorization_url && typeof paymentData.authorization_url === 'string' && paymentData.authorization_url.startsWith('http')) {
                // Do NOT clear cart here — this is only initialization, not a confirmed payment.
                // Paystack may be abandoned. Cart is cleared only on ?status=success return.
                window.location.href = paymentData.authorization_url;
            } else {
                console.error("Invalid authorization_url:", paymentData.authorization_url);
                alert(paymentData.error || "Payment initialization failed. Missing or invalid authorization URL.");
            }
        } catch (error) {
            console.error("Checkout error details:", error);
            if (error instanceof Error) {
                alert(`Checkout error: ${error.message}`);
            } else {
                alert("An error occurred during checkout. Please check console for details.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-primary text-background rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter">Acquisition Successful</h1>
                    <p className="text-secondary uppercase tracking-[0.2em] text-xs font-bold">Your order has been logged in the luxury archive.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard/user/orders" className="bg-primary text-background px-10 py-4 font-bold uppercase tracking-widest hover:bg-secondary transition-colors text-center">
                        View My Orders
                    </Link>
                    <Link href="/" className="border border-border text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all text-center">
                        Return to Collections
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
                 <h2 className="text-2xl font-bold uppercase tracking-tighter">Your Archive is Empty</h2>
                 <Link href="/" className="bg-primary text-background px-8 py-3 text-[10px] font-bold uppercase tracking-widest">
                    Explore Collections
                 </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                    {/* Left: Form */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-bold uppercase tracking-tighter">Checkout</h1>
                                <p className="text-secondary uppercase tracking-[0.2em] text-xs font-bold">Refining your acquisition journey.</p>
                            </div>
                            <button 
                                onClick={runDiagnostic}
                                className="bg-secondary/10 hover:bg-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-secondary/20 transition-colors"
                            >
                                Run System Check
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="space-y-12">
                            {/* Address Selection */}
                            <div className="space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 border-b border-border pb-4">
                                    Shipping Destination
                                </h2>
                                
                                {addresses.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {addresses.map((addr) => (
                                            <div 
                                                key={addr.id}
                                                onClick={() => setSelectedAddress(addr.id)}
                                                className={`p-6 border cursor-pointer transition-all ${
                                                    selectedAddress === addr.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border hover:border-secondary'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold uppercase">{addr.full_name}</p>
                                                    <div className={`w-3 h-3 rounded-full border ${selectedAddress === addr.id ? 'bg-primary border-primary' : 'border-border'}`}></div>
                                                </div>
                                                <p className="text-[10px] text-secondary mt-2 uppercase tracking-widest">{addr.address_line1}, {addr.city}</p>
                                            </div>
                                        ))}
                                        <Link href="/dashboard/user/addresses" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:underline">
                                           <Plus className="w-3 h-3" /> Add New Destination
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="p-12 border border-dashed border-border flex flex-col items-center gap-4 text-center">
                                        <p className="text-[10px] font-bold uppercase text-secondary/50">Exhausted Archive</p>
                                        <Link href="/dashboard/user/addresses" className="bg-primary text-background px-6 py-3 text-[10px] font-bold uppercase tracking-widest">
                                            Register Address
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 border-b border-border pb-4">
                                    Secure Instrument
                                </h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 p-6 bg-secondary/5 border border-border">
                                        <div className="p-3 bg-background border border-border">
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1 pt-1 flex-1">
                                            <p className="text-xs font-bold uppercase">Paystack Secure Checkout</p>
                                            <p className="text-[10px] text-secondary/60 uppercase tracking-widest">Cards, Bank Transfer, Apple Pay.</p>
                                            
                                            <div className="pt-6 flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    id="save_card" 
                                                    checked={saveCard}
                                                    onChange={(e) => setSaveCard(e.target.checked)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <label htmlFor="save_card" className="text-[10px] font-black uppercase tracking-widest text-secondary cursor-pointer">
                                                    Archive Card for future use
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 block">
                                <button 
                                    type="submit" 
                                    disabled={loading || (addresses.length > 0 && !selectedAddress)}
                                    className="w-full bg-primary text-background py-5 font-bold uppercase tracking-[0.2em] text-sm hover:bg-secondary transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing Acquisition...' : `Commit Payment $${cartTotal.toFixed(2)}`}
                                </button>
                                <p className="text-[9px] text-center mt-6 text-secondary/40 uppercase font-black tracking-[0.3em]">
                                    SECURE TLS ENCRYPTED TRANSACTION
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Right: Summary */}
                    <div className="space-y-12">
                         <div className="bg-secondary/5 p-8 md:p-12 h-fit border border-border">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-secondary/40">Order Summary</h3>
                            <div className="space-y-8">
                                {items.map(item => (
                                    <div key={`${item.id}-${item.variant}`} className="flex gap-6">
                                        <div className="relative w-24 h-32 bg-background border border-border flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-primary text-background w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="font-bold uppercase text-sm tracking-tight">{item.name}</h4>
                                                <p className="text-[10px] text-secondary font-medium uppercase tracking-widest mt-1">{item.variant}</p>
                                            </div>
                                            <div className="font-bold text-xs">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border mt-12 pt-8 space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary/60">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary/60">
                                    <span>Shipping</span>
                                    <span>Complimentary</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground text-xl mt-6 pt-6 border-t border-border uppercase tracking-tighter">
                                    <span>Total Amount</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
