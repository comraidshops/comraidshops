'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, Address } from '@/lib/api';

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
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/addresses/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setAddresses(data);
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
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${API_BASE_URL}/addresses/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
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
        }
    };

    const deleteAddress = async (id: number) => {
        const token = localStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/addresses/${id}/`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAddresses();
    };

    if (loading) return null;

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tighter">Address Archive</h2>
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest">Manage your shipping and metabolic destinations.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-background px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Archive New Address
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-background border border-border p-8 overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Recipient Name</label>
                                <input required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                                <input required value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Primary Address</label>
                                <input required value={formData.address_line1} onChange={(e) => setFormData({...formData, address_line1: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City</label>
                                <input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">State / Province</label>
                                <input required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Zip Code</label>
                                <input required value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: e.target.value})} className="w-full bg-secondary/5 border border-border p-3 text-xs" />
                            </div>
                            <div className="space-y-4 md:col-span-2 flex items-center gap-3">
                                <input type="checkbox" id="is_default" checked={formData.is_default} onChange={(e) => setFormData({...formData, is_default: e.target.checked})} className="w-4 h-4 accent-primary" />
                                <label htmlFor="is_default" className="text-[10px] font-bold uppercase tracking-widest text-secondary cursor-pointer">Set as Primary Shipping Address</label>
                            </div>
                            <div className="pt-4 md:col-span-2 border-t border-border flex gap-4">
                                <button type="submit" className="bg-primary text-background px-8 py-3 text-[10px] font-bold uppercase tracking-widest">Commit Address</button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-primary px-8">Cancel</button>
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
                        className={`bg-background border p-6 flex flex-col justify-between group transition-all ${
                            address.is_default ? 'border-primary ring-1 ring-primary/20' : 'border-border hover:border-secondary'
                        }`}
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2 bg-secondary/10 rounded-full">
                                    <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                {address.is_default && (
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary px-2 py-1 bg-primary/5 border border-primary/20">Default</span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm tracking-tight uppercase">{address.full_name}</p>
                                <p className="text-[10px] leading-relaxed text-secondary/70 font-medium">
                                    {address.address_line1}<br />
                                    {address.city}, {address.state} {address.zip_code}<br />
                                    {address.country}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-bold uppercase text-secondary/50">{address.phone_number}</p>
                            <button 
                                onClick={() => deleteAddress(address.id)}
                                className="text-secondary hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
