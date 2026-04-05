'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductsTable, { Product } from '@/components/vendor/ProductsTable';
import { Plus } from 'lucide-react';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-secondary uppercase tracking-widest text-xs">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">Product Management</h2>
        <Link 
          href="/dashboard/vendor/products/create"
          className="bg-primary text-background px-5 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 w-full md:w-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>
      
      <ProductsTable products={products} onDelete={handleDelete} />
    </div>
  );
}
