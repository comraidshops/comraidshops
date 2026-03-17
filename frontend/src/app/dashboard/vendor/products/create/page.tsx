'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(0.10); // Match backend default (10%)

  // Fetch commission rate on load
  React.useEffect(() => {
    const fetchCommission = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.commission_rate) {
            setCommissionRate(Number(data.commission_rate));
          }
        }
      } catch (err) {
        console.error("Failed to fetch commission rate", err);
      }
    };
    fetchCommission();
  }, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Convert Base Price to Listing Price for the backend
    // Listing Price = Base Price * (1 + Commission Rate)
    const basePrice = Number(formData.get('price'));
    const listingPrice = basePrice * (1 + commissionRate);
    formData.set('price', listingPrice.toString());

    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      formData.delete('image');
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        router.push('/dashboard/vendor/products');
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Create New Product</h2>
        <p className="text-sm text-secondary uppercase tracking-widest">Submit a new product for review.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-background border border-border p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-secondary">Product Name *</label>
            <input required type="text" id="name" name="name" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-xs font-bold uppercase tracking-widest text-secondary">Category ID</label>
            <input type="number" id="category" name="category" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="price" className="block text-xs font-bold uppercase tracking-widest text-secondary">Your Price (Desired Earning) *</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              id="price" 
              name="price" 
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="block text-xs font-bold uppercase tracking-widest text-secondary">Initial Stock *</label>
            <input required type="number" id="stock" name="stock" defaultValue="0" min="0" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
        </div>

        {/* Earning Preview Plate */}
        <div className="p-6 bg-secondary/5 border-l-2 border-primary flex flex-col space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
            <span>Platform Markup ({ (commissionRate * 100).toFixed(0) }%)</span>
            <span>+${(price * commissionRate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end border-t border-border pt-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Final Listing Price</span>
            <span className="text-xl font-bold tracking-tighter">${(price * (1 + commissionRate)).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="short_description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Short Description</label>
          <input type="text" id="short_description" name="short_description" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" maxLength={300} />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Full Story & Description</label>
          <textarea id="description" name="description" rows={5} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="block text-xs font-bold uppercase tracking-widest text-secondary">Main Campaign Image</label>
          <input type="file" id="image" name="image" accept="image/*" className="w-full border border-border p-3 bg-secondary/5 focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[10px] text-secondary/60 uppercase tracking-widest">High resolution portrait images are recommended.</p>
        </div>

        <div className="pt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-background px-16 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

