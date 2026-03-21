'use client';

import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Image from 'next/image';

interface BrandFormData {
    name: string;
    tagline: string;
    description: string;
    philosophy: string;
    story: string;
    hero_image: File | null;
    logo: File | null;
    social_links: Record<string, string>;
}

export default function BrandSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [formData, setFormData] = useState<BrandFormData>({
        name: '',
        tagline: '',
        description: '',
        philosophy: '',
        story: '',
        hero_image: null,
        logo: null,
        social_links: {}
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/settings/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        ...data,
                        hero_image: null, // Don't try to set file input from API
                        logo: null
                    });
                }
            } catch (e) { console.error(e); }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('access_token');
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'social_links') {
                        data.append(key, JSON.stringify(value));
                    } else if (value instanceof File) {
                        data.append(key, value);
                    } else {
                        data.append(key, String(value));
                    }
                }
            });

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/settings/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Brand settings updated successfully.' });
            } else {
                setStatus({ type: 'error', message: 'Failed to update settings.' });
            }
        } catch {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 max-w-4xl">
            <h2 className="text-2xl font-bold uppercase tracking-tighter">Brand Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Identity */}
                <div className="bg-background border border-border p-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Visual Identity</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-4">Brand Logo</label>
                            <div className="relative w-32 h-32 bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                                {formData.logo && typeof window !== 'undefined' ? (
                                    <Image 
                                        src={URL.createObjectURL(formData.logo as unknown as Blob)} 
                                        alt="Logo Preview" 
                                        fill 
                                        className="object-contain" 
                                    />
                                ) : (
                                    <Camera className="w-6 h-6 text-secondary/30" />
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setFormData({...formData, logo: e.target.files?.[0] || null})}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-4">Cover Banner</label>
                            <div className="relative h-32 bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                                {formData.hero_image && typeof window !== 'undefined' ? (
                                    <Image 
                                        src={URL.createObjectURL(formData.hero_image as unknown as Blob)} 
                                        alt="Banner Preview" 
                                        fill 
                                        className="object-cover" 
                                    />
                                ) : (
                                    <Camera className="w-6 h-6 text-secondary/30" />
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setFormData({...formData, hero_image: e.target.files?.[0] || null})}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Info */}
                <div className="bg-background border border-border p-8 space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Brand Information</h3>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Brand Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-secondary/5 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Tagline</label>
                        <input 
                            type="text" 
                            value={formData.tagline}
                            onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                            className="w-full bg-secondary/5 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            placeholder="Elevating craft through design"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Description</label>
                        <textarea 
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-secondary/5 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>
                </div>

                {/* Editorial Sections */}
                <div className="bg-background border border-border p-8 space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Editorial content</h3>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Our Philosophy</label>
                        <textarea 
                            rows={4}
                            value={formData.philosophy}
                            onChange={(e) => setFormData({...formData, philosophy: e.target.value})}
                            className="w-full bg-secondary/5 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2">Our Story</label>
                        <textarea 
                            rows={6}
                            value={formData.story}
                            onChange={(e) => setFormData({...formData, story: e.target.value})}
                            className="w-full bg-secondary/5 border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                        />
                    </div>
                </div>

                {status.message && (
                    <div className={`p-4 text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-primary text-background font-bold uppercase tracking-widest px-12 py-4 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
