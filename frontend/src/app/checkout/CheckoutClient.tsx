'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, CreditCard, Plus } from 'lucide-react';
import { API_BASE_URL, initializePayment, Address } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

export default function CheckoutClient() {
    const { items, cartTotal, clearCart, isMounted } = useCart();
    const { notify } = useNotification();
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [saveCard, setSaveCard] = useState(false);

    const [guestEmail, setGuestEmail] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestAddress, setGuestAddress] = useState('');
    const [guestCity, setGuestCity] = useState('');
    const [guestState, setGuestState] = useState('');
    const [guestZip, setGuestZip] = useState('');
    const [guestCountry, setGuestCountry] = useState('Nigeria');
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                setIsGuest(false);
                const res = await fetch(`${API_BASE_URL}/addresses/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAddresses(data);
                    const def = data.find((a: Address) => a.is_default);
                    if (def) setSelectedAddress(def.id);
                }
            } else {
                setIsGuest(true);
            }
        };

        const params = new URLSearchParams(window.location.search);
        if (params.get('status') === 'success') {
            setStep(3);
            clearCart();
        } else {
            fetchAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const runDiagnostic = async () => {
        console.log("--- STARTING CONNECTIVITY DIAGNOSTIC ---");
        const testUrl = `${API_BASE_URL}/products/`;
        try {
            const res = await fetch(testUrl);
            alert("Connection Successful!");
        } catch (err) {
            console.error("DIAGNOSTIC FAILURE", err);
            alert("Connection Failed. Check console.");
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const paymentData = await initializePayment({
                items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                redirect_url: `${window.location.origin}/checkout?status=success`,
                save_card: saveCard,
                address_id: selectedAddress,
                guest_email: isGuest ? guestEmail : undefined,
                shipping_full_name: isGuest ? guestName : undefined,
                shipping_phone_number: isGuest ? guestPhone : undefined,
                shipping_address_line1: isGuest ? guestAddress : undefined,
                shipping_city: isGuest ? guestCity : undefined,
                shipping_state: isGuest ? guestState : undefined,
                shipping_zip_code: isGuest ? guestZip : undefined,
                shipping_country: isGuest ? guestCountry : undefined,
            });

            if (paymentData.authorization_url) {
                window.location.href = paymentData.authorization_url;
            } else {
                notify('error', 'Payment Initialization Failed', paymentData.error || "Missing URL.");
            }
        } catch (error) {
            notify('error', 'Checkout Failed', "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    if (step === 3) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-8">
                <div className="w-24 h-24 bg-primary text-background rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold uppercase tracking-tighter">Acquisition Successful</h1>
                    <p className="text-secondary uppercase tracking-[0.2em] text-xs font-bold">Your order has been logged in the luxury archive.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard/user/orders" className="bg-primary text-background px-10 py-4 font-bold uppercase tracking-widest text-center">
                        View My Orders
                    </Link>
                    <Link href="/" className="border border-border text-foreground px-10 py-4 font-bold uppercase tracking-widest text-center">
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
                    {/* Form Section */}
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
                            {/* Address & Identity Selection */}
                            <div className="space-y-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 border-b border-border pb-4">
                                    {isGuest ? 'Guest Identity & Destination' : 'Shipping Destination'}
                                </h2>

                                {isGuest ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={guestEmail}
                                                    onChange={(e) => setGuestEmail(e.target.value)}
                                                    placeholder="GUEST@EXAMPLE.COM"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestName}
                                                    onChange={(e) => setGuestName(e.target.value)}
                                                    placeholder="CURATED IDENTITY"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Shipping Address</label>
                                            <input
                                                type="text"
                                                required
                                                value={guestAddress}
                                                onChange={(e) => setGuestAddress(e.target.value)}
                                                placeholder="STREET ADDRESS"
                                                className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestCity}
                                                    onChange={(e) => setGuestCity(e.target.value)}
                                                    placeholder="METROPOLIS"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={guestPhone}
                                                    onChange={(e) => setGuestPhone(e.target.value)}
                                                    placeholder="+234 ..."
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">State</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestState}
                                                    onChange={(e) => setGuestState(e.target.value)}
                                                    placeholder="STATE"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Zip/Postal Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestZip}
                                                    onChange={(e) => setGuestZip(e.target.value)}
                                                    placeholder="100001"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Country</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestCountry}
                                                    onChange={(e) => setGuestCountry(e.target.value)}
                                                    placeholder="COUNTRY"
                                                    className="w-full bg-secondary/5 border border-border p-4 text-xs font-bold uppercase placeholder:text-secondary/20 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : addresses.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => setSelectedAddress(addr.id)}
                                                className={`p-6 border cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border hover:border-secondary'
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
                                    disabled={
                                        loading ||
                                        (!isGuest && !selectedAddress) ||
                                        (isGuest && (!guestEmail || !guestAddress || !guestName || !guestPhone || !guestCity || !guestState))
                                    }
                                    className="w-full bg-primary text-background py-5 font-bold uppercase tracking-[0.2em] text-sm hover:bg-secondary transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing Acquisition...' : `Execute Protocol ₦${cartTotal.toLocaleString()}`}
                                </button>
                                <p className="text-[9px] text-center mt-6 text-secondary/40 uppercase font-black tracking-[0.3em]">
                                    SECURE TLS ENCRYPTED TRANSACTION
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Summary Section */}
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
                                                ₦{(item.price * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border mt-12 pt-8 space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary/60">
                                    <span>₦{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary/60">
                                    <span>Shipping</span>
                                    <span>Complimentary</span>
                                </div>
                                <div className="flex justify-between font-bold text-foreground text-xl mt-6 pt-6 border-t border-border uppercase tracking-tighter">
                                    <span>₦{cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
