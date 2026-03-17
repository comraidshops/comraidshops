'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [commissionRate, setCommissionRate] = useState<number>(0.10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Fetch dashboard metrics to get commission rate
        const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dashboardRes.ok) {
          const dashData = await dashboardRes.json();
          if (dashData.commission_rate) {
            setCommissionRate(Number(dashData.commission_rate));
          }
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setError("Failed to fetch product details.");
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Convert Base Price to Listing Price for the backend
    const basePrice = Number(formData.get('price'));
    const listingPrice = basePrice * (1 + commissionRate);
    formData.set('price', listingPrice.toString());

    const imageFile = formData.get('image') as File | null;
    if (!imageFile || imageFile.size === 0) {
      formData.delete('image');
    }

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/${id}/`, {
        method: 'PUT',
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
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPrice = product?.price ? Number(product.price) : 0;
  const initialBasePrice = currentPrice / (1 + commissionRate);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><p className="text-secondary uppercase tracking-widest text-xs">Loading product...</p></div>;
  }

  if (!product) {
    return <div className="p-8 border border-border bg-red-50"><p className="text-red-500 font-bold uppercase tracking-widest text-xs">Product not found. {error}</p></div>;
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Edit Product</h2>
        <p className="text-sm text-secondary uppercase tracking-widest">Update details for {product.name}</p>
      </div>

      <div className="p-6 bg-secondary/5 border border-border flex items-center justify-between">
        <div>
           <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Status</p>
           <p className={`font-bold text-xs uppercase tracking-widest ${
             product.status === 'approved' ? 'text-green-600' :
             product.status === 'pending' ? 'text-amber-600' :
             'text-secondary'
           }`}>{product.status}</p>
        </div>
        <div className="text-right text-[10px] text-secondary uppercase tracking-widest font-bold max-w-xs">
          Status is managed by administrators. Changing details will not alter the status.
        </div>
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
            <input required type="text" id="name" name="name" defaultValue={product.name} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-xs font-bold uppercase tracking-widest text-secondary">Category ID</label>
            <input type="number" id="category" name="category" defaultValue={product.category} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="price" className="block text-xs font-bold uppercase tracking-widest text-secondary">Your Price (Desired Earning) *</label>
            <input required type="number" step="0.01" id="price" name="price" defaultValue={initialBasePrice.toFixed(2)} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="block text-xs font-bold uppercase tracking-widest text-secondary">Current Stock *</label>
            <input required type="number" id="stock" name="stock" defaultValue={product.stock} min="0" className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
        </div>

        {/* Markup Info Plate */}
        <div className="p-6 bg-secondary/5 border-l-2 border-primary flex flex-col space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
            <span>Platform Markup ({ (commissionRate * 100).toFixed(0) }%)</span>
          </div>
          <div className="flex justify-between items-end border-t border-border pt-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Current Listing Price</span>
            <span className="text-xl font-bold tracking-tighter">${currentPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="short_description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Short Description</label>
          <input type="text" id="short_description" name="short_description" defaultValue={product.short_description} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" maxLength={300} />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Full Story & Description</label>
          <textarea id="description" name="description" rows={5} defaultValue={product.description} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
        </div>

        <div className="space-y-4">
          <label htmlFor="image" className="block text-xs font-bold uppercase tracking-widest text-secondary">Campaign Image</label>
          {product.image && (
            <div className="relative w-24 h-32 bg-secondary/10 border border-border overflow-hidden">
               <Image 
                 src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                 alt="Current product image" 
                 fill
                 className="object-cover" 
               />
            </div>
          )}
          <input type="file" id="image" name="image" accept="image/*" className="w-full border border-border p-3 bg-secondary/5 focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">Leaving blank keeps current image.</p>
        </div>

        <div className="pt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-primary text-background px-16 py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

