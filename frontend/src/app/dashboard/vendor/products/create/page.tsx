'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Image as ImageIcon, Video, Info, Tag, Layers, Settings } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Variant {
  name: string;
  stock: string | number;
}

interface Specification {
  name: string;
  value: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(0.10);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Dynamic fields state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const [dashRes, catRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`)
        ]);

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData.commission_rate) setCommissionRate(Number(dashData.commission_rate));
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.results || catData);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  const addVariant = () => setVariants([...variants, { name: '', stock: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const addSpec = () => setSpecifications([...specifications, { name: '', value: '' }]);
  const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: keyof Specification, value: string) => {
    const next = [...specifications];
    next[index] = { ...next[index], [field]: value };
    setSpecifications(next);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAdditionalImages([...additionalImages, ...Array.from(e.target.files)]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Financials logic
    const basePrice = Number(formData.get('price'));
    const listingPrice = basePrice * (1 + commissionRate);
    formData.set('price', listingPrice.toFixed(2));

    // Primary image check
    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) formData.delete('image');

    // Add additional images
    additionalImages.forEach((file) => {
      formData.append('uploaded_images', file);
    });

    // Add JSON fields
    formData.append('variants', JSON.stringify(variants));
    formData.append('specifications', JSON.stringify(specifications));

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/create/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        router.push('/dashboard/vendor/products');
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-tighter mb-2">Publish New Design</h2>
          <p className="text-sm text-secondary uppercase tracking-[0.2em]">Curation & Listing Management</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase underline tracking-widest text-secondary cursor-help">
          <Info className="w-3 h-3" /> Listing Guidelines
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold uppercase tracking-widest">
            {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-16">
        
        {/* SECTION: Identity */}
        <section className="space-y-8 bg-background border border-border p-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Tag className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Identity & Classification</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Product Name *</label>
              <input required type="text" id="name" name="name" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" placeholder="e.g. Sculptural Ceramic Vessel" />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Collection Category *</label>
              <select required id="category" name="category" className="w-full bg-secondary/5 border border-border px-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm appearance-none cursor-pointer">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Your Earning (NGN) *</label>
              <input required type="number" step="0.01" id="price" name="price" onChange={(e) => setPrice(Number(e.target.value))} placeholder="0.00" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" />
            </div>
            <div className="space-y-2">
              <label htmlFor="stock" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Total Stock *</label>
              <input required type="number" id="stock" name="stock" defaultValue="0" min="0" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" />
            </div>
            <div className="space-y-2">
              <label htmlFor="origin_country" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Origin Country</label>
              <input type="text" id="origin_country" name="origin_country" placeholder="e.g. Nigeria" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" />
            </div>
          </div>

          {/* Earning Preview */}
          <div className="p-6 bg-secondary/5 border-l-2 border-primary flex flex-col space-y-2">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] text-secondary font-bold">
              <span>Platform Service Fee ({ (commissionRate * 100).toFixed(0) }%)</span>
              <span>+₦{(price * commissionRate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-t border-border pt-4">
              <span className="text-[11px] uppercase tracking-[0.2em] text-primary font-bold">Final Listing Price</span>
              <span className="text-2xl font-bold tracking-tighter">₦{(price * (1 + commissionRate)).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* SECTION: Narrative */}
        <section className="space-y-8 bg-background border border-border p-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Narrative & Editorial</h3>
            </div>

            <div className="space-y-2">
              <label htmlFor="short_description" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Campaign Tagline (Short Description)</label>
              <input type="text" id="short_description" name="short_description" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" maxLength={300} placeholder="A one-sentence hook for the product card" />
            </div>

            <div className="space-y-2">
              <label htmlFor="story" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">The Story Behind the Piece</label>
              <textarea id="story" name="story" rows={4} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm font-serif italic" placeholder="The inspiration, technique, or designer's intent..."></textarea>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Technical Description</label>
              <textarea id="description" name="description" rows={5} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none text-sm" placeholder="Detailed product specifications, dimensions, and utility..."></textarea>
            </div>

            <div className="space-y-2">
                <label htmlFor="editorial_quote" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Designer's Quote</label>
                <input type="text" id="editorial_quote" name="editorial_quote" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12 text-sm" placeholder='"This piece represents the intersection of..."' />
            </div>
        </section>

        {/* SECTION: Multimedia */}
        <section className="space-y-8 bg-background border border-border p-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cinematic Assets</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Main Hero Image *</label>
                    <div className="relative group aspect-[4/5] bg-secondary/5 border border-dashed border-border flex items-center justify-center overflow-hidden">
                        <input required type="file" id="image" name="image" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="text-center group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-secondary/40 mx-auto mb-2" />
                            <p className="text-[10px] uppercase font-bold tracking-widest text-secondary/60">Upload Campaign Image</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Gallery Extensions</label>
                    <div className="grid grid-cols-2 gap-4">
                        {additionalImages.map((file, idx) => (
                            <div key={idx} className="relative aspect-square bg-secondary/10 border border-border">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                                <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-2 right-2 p-1 bg-background border border-border text-red-500 hover:bg-red-500/10">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square bg-secondary/5 border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors">
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            <Plus className="w-6 h-6 text-secondary/40" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                <label htmlFor="uploaded_video_360" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
                    <Video className="w-3 h-3" /> 360° Cinematic Video
                </label>
                <input type="file" id="uploaded_video_360" name="uploaded_video_360" accept="video/*" className="w-full border border-border p-3 bg-secondary/5 text-sm" />
            </div>
        </section>

        {/* SECTION: Details & Specs */}
        <section className="space-y-8 bg-background border border-border p-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Technical Specs & Variants</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Variants Control */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Available Variants</label>
                        <button type="button" onClick={addVariant} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Variant
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {variants.map((v, idx) => (
                            <div key={idx} className="flex gap-4 items-end">
                                <div className="flex-1 space-y-1">
                                    <input type="text" placeholder="Name (e.g. Size M)" value={v.name} onChange={(e) => updateVariant(idx, 'name', e.target.value)} className="w-full bg-secondary/5 border border-border p-2 text-xs text-primary focus:outline-none focus:border-primary" />
                                </div>
                                <div className="w-24 space-y-1">
                                    <input type="text" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} className="w-full bg-secondary/5 border border-border p-2 text-xs text-primary focus:outline-none focus:border-primary" />
                                </div>
                                <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attributes Control */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Key Specifications</label>
                        <button type="button" onClick={addSpec} className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add Spec
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {specifications.map((s, idx) => (
                            <div key={idx} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <input type="text" placeholder="Attribute (e.g. Material)" value={s.name} onChange={(e) => updateSpec(idx, 'name', e.target.value)} className="w-full bg-secondary/5 border border-border p-2 text-xs text-primary focus:outline-none focus:border-primary" />
                                </div>
                                <div className="flex-1">
                                    <input type="text" placeholder="Value" value={s.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} className="w-full bg-secondary/5 border border-border p-2 text-xs text-primary focus:outline-none focus:border-primary" />
                                </div>
                                <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border">
                <div className="space-y-2">
                    <label htmlFor="materials" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Materials Used</label>
                    <input type="text" id="materials" name="materials" placeholder="e.g. Fine Silk, Brushed Brass" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary h-12 text-sm" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="fit" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Fit / Dimensions</label>
                    <input type="text" id="fit" name="fit" placeholder="e.g. Oversized, 20x30cm" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary h-12 text-sm" />
                </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="care_instructions" className="block text-[10px] font-bold uppercase tracking-widest text-secondary">Care Instructions</label>
              <textarea id="care_instructions" name="care_instructions" rows={3} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary resize-none text-sm" placeholder="How to maintain the piece's quality..."></textarea>
            </div>
        </section>

        <div className="pt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-background px-24 py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-primary/95 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-2xl"
          >
            {loading ? 'Transmitting Data...' : 'Request Curation (Review)'}
          </button>
        </div>
      </form>
    </div>
  );
}

