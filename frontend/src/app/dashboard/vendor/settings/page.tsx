'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface BrandFormData {
    name: string;
    tagline: string;
    description: string;
    philosophy: string;
    story: string;
    hero_image: File | null;
    logo: File | null;
    social_links: Record<string, string>;
    website: string;
    founder_name: string;
    founder_bio: string;
    founder_image: File | null;
    established_year: string;
    origin_country: string;
    awards: string;
    manifesto: string;
    featured_quote: string;
}

interface ExistingImages {
    hero_image: string;
    logo: string;
    founder_image: string;
}

export default function BrandSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [existingImages, setExistingImages] = useState<ExistingImages>({
        hero_image: '',
        logo: '',
        founder_image: '',
    });
    const [formData, setFormData] = useState<BrandFormData>({
        name: '',
        tagline: '',
        description: '',
        philosophy: '',
        story: '',
        hero_image: null,
        logo: null,
        social_links: {},
        website: '',
        founder_name: '',
        founder_bio: '',
        founder_image: null,
        established_year: '',
        origin_country: '',
        awards: '',
        manifesto: '',
        featured_quote: '',
    });

    // Refs for file inputs so we can reset them
    const logoInputRef = useRef<HTMLInputElement>(null);
    const heroInputRef = useRef<HTMLInputElement>(null);
    const founderInputRef = useRef<HTMLInputElement>(null);

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
                        name: data.name || '',
                        tagline: data.tagline || '',
                        description: data.description || '',
                        philosophy: data.philosophy || '',
                        story: data.story || '',
                        hero_image: null,
                        logo: null,
                        social_links: data.social_links || {},
                        website: data.website || '',
                        founder_name: data.founder_name || '',
                        founder_bio: data.founder_bio || '',
                        founder_image: null,
                        established_year: data.established_year ? String(data.established_year) : '',
                        origin_country: data.origin_country || '',
                        awards: data.awards || '',
                        manifesto: data.manifesto || '',
                        featured_quote: data.featured_quote || '',
                    });
                    setExistingImages({
                        hero_image: data.hero_image || '',
                        logo: data.logo || '',
                        founder_image: data.founder_image || '',
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setFetching(false);
            }
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

            // Text fields
            const textFields: (keyof BrandFormData)[] = [
                'name', 'tagline', 'description', 'philosophy', 'story',
                'website', 'founder_name', 'founder_bio', 'origin_country',
                'awards', 'manifesto', 'featured_quote',
            ];
            textFields.forEach(key => {
                data.append(key, String(formData[key] ?? ''));
            });

            // Numeric field — only send if non-empty
            if (formData.established_year) {
                data.append('established_year', formData.established_year);
            } else {
                data.append('established_year', '');
            }

            // Social links as JSON
            data.append('social_links', JSON.stringify(formData.social_links));

            // File fields — only send if a new file was selected
            if (formData.hero_image) data.append('hero_image', formData.hero_image);
            if (formData.logo) data.append('logo', formData.logo);
            if (formData.founder_image) data.append('founder_image', formData.founder_image);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/settings/`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                const responseData = await res.json();
                // Refresh existing image URLs from response
                setExistingImages({
                    hero_image: responseData.hero_image || '',
                    logo: responseData.logo || '',
                    founder_image: responseData.founder_image || '',
                });
                // Clear file selections
                setFormData(prev => ({
                    ...prev,
                    hero_image: null,
                    logo: null,
                    founder_image: null,
                    established_year: responseData.established_year ? String(responseData.established_year) : '',
                }));
                setStatus({ type: 'success', message: 'Brand settings updated successfully.' });
            } else {
                const errorData = await res.json().catch(() => null);
                if (errorData && typeof errorData === 'object' && !errorData.error && !errorData.detail) {
                    const messages = Object.entries(errorData)
                        .map(([field, errors]) => {
                            const label = field.replace(/_/g, ' ');
                            const msg = Array.isArray(errors) ? errors.join(', ') : String(errors);
                            return `${label}: ${msg}`;
                        });
                    setStatus({ type: 'error', message: messages.join(' · ') });
                } else {
                    setStatus({ type: 'error', message: errorData?.error || errorData?.detail || 'Failed to update settings.' });
                }
            }
        } catch {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const getImagePreview = (
        fileValue: File | null,
        existingUrl: string
    ): string | null => {
        if (fileValue) return URL.createObjectURL(fileValue);
        if (existingUrl) return existingUrl;
        return null;
    };

    const clearFileSelection = (field: 'hero_image' | 'logo' | 'founder_image') => {
        setFormData(prev => ({ ...prev, [field]: null }));
        const refMap = { hero_image: heroInputRef, logo: logoInputRef, founder_image: founderInputRef };
        if (refMap[field]?.current) refMap[field].current!.value = '';
    };

    if (fetching) {
        return (
            <div className="space-y-5 md:space-y-8 pb-8 md:pb-12 max-w-4xl">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Brand Settings</h2>
                <div className="bg-background border border-border p-8 text-center text-secondary text-sm">
                    Loading brand settings...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 md:space-y-8 pb-8 md:pb-12 max-w-4xl">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Brand Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
                {/* ── Visual Identity ─────────────────────────────── */}
                <div className="bg-background border border-border p-5 md:p-8">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-5 md:mb-8">Visual Identity</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* Logo */}
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-3 md:mb-4">Brand Logo</label>
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                                {(() => {
                                    const src = getImagePreview(formData.logo, existingImages.logo);
                                    return src ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt="Logo Preview" className="w-full h-full object-contain" />
                                            {formData.logo && (
                                                <button type="button" onClick={() => clearFileSelection('logo')} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black transition-colors z-10">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <Camera className="w-5 h-5 md:w-6 md:h-6 text-secondary/30" />
                                    );
                                })()}
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            {existingImages.logo && !formData.logo && (
                                <p className="text-[9px] text-secondary/50 mt-1.5 uppercase tracking-widest">Current image saved</p>
                            )}
                        </div>

                        {/* Cover Banner */}
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-3 md:mb-4">Cover Banner</label>
                            <div className="relative h-24 md:h-32 bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                                {(() => {
                                    const src = getImagePreview(formData.hero_image, existingImages.hero_image);
                                    return src ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt="Banner Preview" className="w-full h-full object-cover" />
                                            {formData.hero_image && (
                                                <button type="button" onClick={() => clearFileSelection('hero_image')} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black transition-colors z-10">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <Camera className="w-5 h-5 md:w-6 md:h-6 text-secondary/30" />
                                    );
                                })()}
                                <input
                                    ref={heroInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, hero_image: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            {existingImages.hero_image && !formData.hero_image && (
                                <p className="text-[9px] text-secondary/50 mt-1.5 uppercase tracking-widest">Current image saved</p>
                            )}
                        </div>

                        {/* Founder Image */}
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-3 md:mb-4">Founder Image</label>
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                                {(() => {
                                    const src = getImagePreview(formData.founder_image, existingImages.founder_image);
                                    return src ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt="Founder Preview" className="w-full h-full object-cover" />
                                            {formData.founder_image && (
                                                <button type="button" onClick={() => clearFileSelection('founder_image')} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black transition-colors z-10">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <Camera className="w-5 h-5 md:w-6 md:h-6 text-secondary/30" />
                                    );
                                })()}
                                <input
                                    ref={founderInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, founder_image: e.target.files?.[0] || null })}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            {existingImages.founder_image && !formData.founder_image && (
                                <p className="text-[9px] text-secondary/50 mt-1.5 uppercase tracking-widest">Current image saved</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Brand Information ───────────────────────────── */}
                <div className="bg-background border border-border p-5 md:p-8 space-y-4 md:space-y-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">Brand Information</h3>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Brand Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Tagline</label>
                        <input
                            type="text"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                            placeholder="Elevating craft through design"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Featured Quote</label>
                        <input
                            type="text"
                            value={formData.featured_quote}
                            onChange={(e) => setFormData({ ...formData, featured_quote: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                            placeholder="A defining statement for your brand"
                        />
                    </div>
                </div>

                {/* ── Founder & Heritage ──────────────────────────── */}
                <div className="bg-background border border-border p-5 md:p-8 space-y-4 md:space-y-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">Founder &amp; Heritage</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Founder Name</label>
                            <input
                                type="text"
                                value={formData.founder_name}
                                onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                                className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Established</label>
                                <input
                                    type="number"
                                    value={formData.established_year}
                                    onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="2020"
                                    min="1800"
                                    max="2099"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Origin</label>
                                <input
                                    type="text"
                                    value={formData.origin_country}
                                    onChange={(e) => setFormData({ ...formData, origin_country: e.target.value })}
                                    className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                    placeholder="Nigeria"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Founder Bio</label>
                        <textarea
                            rows={4}
                            value={formData.founder_bio}
                            onChange={(e) => setFormData({ ...formData, founder_bio: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                            placeholder="Tell the story of your brand's founder..."
                        />
                    </div>
                </div>

                {/* ── Editorial Content ───────────────────────────── */}
                <div className="bg-background border border-border p-5 md:p-8 space-y-4 md:space-y-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">Editorial Content</h3>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Our Philosophy</label>
                        <textarea
                            rows={4}
                            value={formData.philosophy}
                            onChange={(e) => setFormData({ ...formData, philosophy: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                            placeholder="What drives your brand's creative vision..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Our Story</label>
                        <textarea
                            rows={6}
                            value={formData.story}
                            onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                            placeholder="The journey of your brand..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Manifesto</label>
                        <textarea
                            rows={4}
                            value={formData.manifesto}
                            onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                            placeholder="Your brand's declaration of intent..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Awards &amp; Recognition</label>
                        <textarea
                            rows={3}
                            value={formData.awards}
                            onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                            placeholder="Notable awards, press mentions, achievements..."
                        />
                    </div>
                </div>

                {/* ── Links & Socials ─────────────────────────────── */}
                <div className="bg-background border border-border p-5 md:p-8 space-y-4 md:space-y-6">
                    <h3 className="text-[11px] md:text-sm font-bold uppercase tracking-widest mb-1 md:mb-2">Links &amp; Socials</h3>

                    <div>
                        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                            placeholder="https://yourbrand.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Instagram</label>
                            <input
                                type="text"
                                value={formData.social_links.instagram || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    social_links: { ...formData.social_links, instagram: e.target.value }
                                })}
                                className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="@yourbrand"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-secondary mb-1.5 md:mb-2">Twitter / X</label>
                            <input
                                type="text"
                                value={formData.social_links.twitter || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    social_links: { ...formData.social_links, twitter: e.target.value }
                                })}
                                className="w-full bg-secondary/5 border border-border px-3 md:px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="@yourbrand"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Status Message ──────────────────────────────── */}
                {status.message && (
                    <div className={`p-3 md:p-4 text-[10px] md:text-xs font-bold uppercase tracking-widest ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.message}
                    </div>
                )}

                {/* ── Submit ──────────────────────────────────────── */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-background font-bold uppercase tracking-widest px-8 md:px-12 py-3.5 md:py-4 text-[10px] md:text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 w-full md:w-auto active:scale-[0.98]"
                >
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
