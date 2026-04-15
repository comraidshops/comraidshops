'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeFetch, Address } from '@/lib/api';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Nigeria',
        is_default: false
    });

    const fetchAddresses = async () => {
        try {
            const data = await safeFetch('/addresses/');
            if (data) setAddresses(data);
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        const load = async () => {
            await fetchAddresses();
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic Validation
        const phoneRegex = /^[0-9+ \-()]{8,20}$/;
        if (!phoneRegex.test(formData.phone_number)) {
            alert("Please enter a valid phone number.");
            return;
        }

        try {
            await safeFetch('/addresses/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            setShowForm(false);
            setFormData({
                full_name: '',
                phone_number: '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                zip_code: '',
                country: 'Nigeria',
                is_default: false
            });
            fetchAddresses();
        } catch (err: any) {
            alert(err.message || "Failed to save address.");
        }
    };

    const deleteAddress = async (id: number) => {
        try {
            await safeFetch(`/addresses/${id}/`, {
                method: 'DELETE'
            });
            fetchAddresses();
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-12">
            <div className="border-b border-border pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-cormorant italic">Saved Addresses</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mt-4 leading-relaxed">
                        Manage your shipping destinations for seamless delivery.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-foreground text-background px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:translate-y-[-2px] transition-transform shadow-xl flex items-center justify-center gap-3"
                >
                    <Plus className="w-4 h-4" />
                    Add New Address
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-background border border-border p-10 overflow-hidden shadow-sm"
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">Full Name</label>
                                <input required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">Phone Number</label>
                                <input required value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">Street Address</label>
                                <input required value={formData.address_line1} onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">City</label>
                                <input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">State / Province</label>
                                <input required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50">Zip / Postal Code</label>
                                <input required value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} className="w-full bg-secondary/5 border-b border-border p-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:border-foreground transition-all focus:bg-background" />
                            </div>
                            <div className="space-y-4 md:col-span-2 flex items-center gap-4 py-4">
                                <input type="checkbox" id="is_default" checked={formData.is_default} onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })} className="w-4 h-4 accent-foreground" />
                                <label htmlFor="is_default" className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/50 cursor-pointer">Set as Default Shipping Address</label>
                            </div>
                            <div className="pt-10 md:col-span-2 border-t border-foreground/5 flex gap-6 justify-end">
                                <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40 hover:text-foreground transition-colors px-6">Cancel</button>
                                <button type="submit" className="bg-foreground text-background px-12 py-4 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:translate-y-[-2px] transition-transform">Save Address</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addresses.map((address) => (
                    <motion.div
                        key={address.id}
                        layout
                        className={`bg-background px-8 py-10 flex flex-col justify-between group transition-all duration-500 shadow-sm hover:shadow-xl relative overflow-hidden border-t-[0.5px] border-b-[0.5px] border-border hover:border-foreground/20`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <MapPin className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-foreground/5 border border-foreground/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                    <MapPin className="w-4 h-4 text-foreground/40" />
                                </div>
                                {address.is_default && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-foreground px-2 py-1 bg-foreground/5 border-[0.5px] border-foreground/10">Default Address</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-lg tracking-tight uppercase leading-none">{address.full_name}</p>
                                <p className="text-[10px] leading-relaxed text-secondary/50 font-black uppercase tracking-widest">
                                    {address.address_line1}<br />
                                    {address.city}, {address.state} {address.zip_code}<br />
                                    {address.country}
                                </p>
                            </div>
                        </div>

                        <div className="pt-8 mt-10 border-t border-foreground/5 flex items-center justify-between relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary/30">{address.phone_number}</p>
                            <button
                                onClick={() => deleteAddress(address.id)}
                                className="text-secondary/40 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
