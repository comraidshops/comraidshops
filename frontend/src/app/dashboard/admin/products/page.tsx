'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Star, 
    Search, ImageIcon,
    Trash2, Edit3, Plus
} from 'lucide-react';
import { safeFetch, API_BASE_URL } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import Image from 'next/image';
import { AdminModal, AdminInput, AdminSelect, AdminImageUpload, AdminRichText } from '@/components/admin/AdminForms';

interface Product {
    id: number;
    name: string;
    short_description: string;
    description: string;
    story: string;
    materials: string;
    care_instructions: string;
    origin_country: string;
    fit: string;
    weight: string;
    hero_video: string;
    editorial_quote: string;
    slug: string;
    vendor_name: string;
    price: number;
    stock: number;
    status: 'draft' | 'pending' | 'approved';
    is_featured: boolean;
    image: string;
    images?: { id: number; image: string }[];
    video_360?: { id: number; video: string } | null;
    category: number;
    category_slug: string;
    uploaded_images?: File[];
    uploaded_video_360?: File;
    vendor?: number;
}

interface Category {
    id: number;
    name: string;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [vendors, setVendors] = useState<{id: number, brand_name: string}[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);

    const { notify } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [productData, categoryData, vendorData] = await Promise.all([
                safeFetch('/admin-api/products/'),
                safeFetch('/categories/'),
                safeFetch('/admin-api/vendors/')
            ]);
            setProducts(productData);
            setCategories(categoryData);
            setVendors(vendorData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    }

    async function handleCreateProduct(e: React.FormEvent) {
        e.preventDefault();
        if (!currentProduct) return;
        setActionLoading(true);
        try {
            const formData = new FormData();
            Object.entries(currentProduct).forEach(([key, val]) => {
                if (key === 'images' || key === 'video_360') return; // Read-only nested fields from backend
                if (key === 'uploaded_images' && Array.isArray(val)) {
                    val.forEach((file: any) => formData.append('uploaded_images', file));
                } else if (key === 'collections' && Array.isArray(val)) {
                    val.forEach((id: any) => formData.append('collections', id));
                } else if (key === 'uploaded_video_360' && val instanceof File) {
                    formData.append('uploaded_video_360', val);
                } else if (val !== null && val !== undefined) {
                    formData.append(key, val as string | Blob);
                }
            });

            const newProduct = await safeFetch('/admin-api/products/', {
                method: 'POST',
                body: formData
            });
            setProducts([newProduct, ...products]);
            setIsCreateModalOpen(false);
            setCurrentProduct(null);
            notify('success', 'Product Created', `${newProduct.name} has been added successfully.`);
        } catch (error: unknown) {
            notify('error', 'Creation Failed', (error as Error)?.message || "Failed to create product");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateProduct(e: React.FormEvent) {
        e.preventDefault();
        if (!currentProduct?.id) return;
        setActionLoading(true);
        try {
            const formData = new FormData();
            Object.entries(currentProduct).forEach(([key, val]) => {
                if (key === 'images' || key === 'video_360' || key === 'slug' || key === 'vendor_name' || key === 'category_slug') return;
                if (key === 'uploaded_images' && Array.isArray(val)) {
                    val.forEach((file: any) => formData.append('uploaded_images', file));
                } else if (key === 'collections' && Array.isArray(val)) {
                    val.forEach((id: any) => formData.append('collections', id));
                } else if (key === 'uploaded_video_360' && val instanceof File) {
                    formData.append('uploaded_video_360', val);
                } else if (val && (val as any) instanceof File) {
                    formData.append(key, val as any);
                } else if (val !== null && val !== undefined) {
                    if (typeof val !== 'string' || !val.startsWith('http')) {
                        formData.append(key, val as string | Blob);
                    }
                }
            });

            const updated = await safeFetch(`/admin-api/products/${currentProduct.id}/`, {
                method: 'PATCH',
                body: formData
            });
            setProducts(products.map(p => p.id === updated.id ? updated : p));
            setIsEditModalOpen(false);
            notify('success', 'Product Updated', `${updated.name} has been successfully updated.`);
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || "Failed to update product");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteProduct() {
        if (!currentProduct?.id) return;
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/products/${currentProduct.id}/`, { method: 'DELETE' });
            setProducts(products.filter(p => p.id !== currentProduct.id));
            setIsDeleteModalOpen(false);
            notify('success', 'Product Deleted', 'The product has been successfully removed.');
        } catch (error: unknown) {
            notify('error', 'Delete Failed', (error as Error)?.message || "Failed to delete product");
        } finally {
            setActionLoading(false);
        }
    }

    async function updateStatus(productId: number, status: 'approved' | 'draft') {
        try {
            const endpoint = status === 'approved' ? 'approve' : 'reject';
            await safeFetch(`/admin-api/products/${productId}/${endpoint}/`, { method: 'POST' });
            setProducts(products.map(p => p.id === productId ? { ...p, status } : p));
        } catch (error: unknown) {
            notify('error', 'Status Change Failed', (error as Error)?.message || "Failed to update product status");
        }
    }

    async function toggleFeatured(productId: number, current: boolean) {
        try {
            await safeFetch(`/admin-api/products/${productId}/`, { 
                method: 'PATCH',
                body: JSON.stringify({ is_featured: !current })
            });
            setProducts(products.map(p => p.id === productId ? { ...p, is_featured: !current } : p));
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || "Failed to update featured status");
        }
    }

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Catalog Oversight</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Global <span className="italic opacity-80">Inventory.</span></h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Search products or vendors..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-full"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setCurrentProduct({ status: 'approved', is_featured: false, stock: 0, price: 0 });
                            setIsCreateModalOpen(true);
                        }}
                        className="bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] transition-all w-full lg:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-3 lg:gap-4 border-b border-white/5 pb-8">
                {[
                    { id: 'all', label: 'All Products' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Live' },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id as 'all' | 'pending' | 'approved')}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all ${
                            statusFilter === f.id 
                            ? 'bg-primary text-black' 
                            : 'bg-white/[0.02] text-white/40 hover:text-white hover:bg-white/5 border border-white/5'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, idx) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all p-5 lg:p-6 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 group"
                        >
                            <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/5 shrink-0">
                                {product.image ? (
                                    <Image src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `${API_BASE_URL}${product.image}`} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/10">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow min-w-0 w-full lg:w-auto">
                                <div className="flex items-center gap-3 mb-2 lg:mb-1">
                                    <h3 className="text-base lg:text-lg font-medium tracking-tight truncate">{product.name}</h3>
                                    {product.is_featured && <Star className="w-3 h-3 text-primary fill-primary" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-bold tracking-[0.1em] uppercase">
                                    <span className="text-white/40">By {product.vendor_name}</span>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-primary">₦{product.price.toLocaleString()}</span>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                                    <span className={product.stock < 5 ? 'text-red-400' : 'text-white/40'}>{product.stock} in stock</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                <div className="text-right">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                        product.status === 'approved' ? 'bg-primary/10 text-primary' : 
                                        product.status === 'pending' ? 'bg-orange-400/10 text-orange-400' : 
                                        'bg-white/5 text-white/20'
                                    }`}>
                                        {product.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {product.status !== 'approved' && (
                                        <button 
                                            onClick={() => updateStatus(product.id, 'approved')}
                                            className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl bg-primary text-black text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => toggleFeatured(product.id, product.is_featured)}
                                        className={`p-2.5 lg:p-3 rounded-xl border border-white/5 transition-all ${
                                            product.is_featured ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/40 hover:text-white'
                                        }`}
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCurrentProduct(product);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-white/40 hover:text-white border border-white/5 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setCurrentProduct(product);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-red-400/60 hover:text-red-400 border border-white/5 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {filteredProducts.length === 0 && (
                    <div className="p-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[40px]">
                        <ShoppingBag className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No matching products found</p>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            <AdminModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                title="Assemble Product"
                loading={actionLoading}
            >
                <form onSubmit={handleCreateProduct} className="space-y-6">
                    <AdminInput 
                        label="Product Name" 
                        placeholder="E.g. Vintage Silk Scarf"
                        value={currentProduct?.name || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    />
                    <AdminInput 
                        label="Short Description" 
                        placeholder="A brief summary of the product"
                        value={currentProduct?.short_description || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, short_description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Price (₦)" 
                            type="number"
                            value={currentProduct?.price || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentProduct({ ...currentProduct, price: val ? parseFloat(val) : 0 });
                            }}
                        />
                        <AdminInput 
                            label="Stock Level" 
                            type="number"
                            value={currentProduct?.stock || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentProduct({ ...currentProduct, stock: val ? parseInt(val) : 0 });
                            }}
                        />
                    </div>
                    <AdminSelect 
                        label="Category"
                        value={currentProduct?.category || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value ? parseInt(e.target.value) : undefined })}
                        options={[
                            { value: '', label: 'Select Category' },
                            ...categories.map(c => ({ value: c.id, label: c.name }))
                        ]}
                    />

                    <AdminSelect 
                        label="Assign Vendor (Curator)"
                        value={currentProduct?.vendor || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, vendor: e.target.value ? parseInt(e.target.value) : undefined })}
                        options={[
                            { value: '', label: 'Select Vendor' },
                            ...vendors.map(v => ({ value: v.id, label: v.brand_name }))
                        ]}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Materials" 
                            value={currentProduct?.materials || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, materials: e.target.value })}
                        />
                        <AdminInput 
                            label="Fit" 
                            value={currentProduct?.fit || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, fit: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Origin Country" 
                            value={currentProduct?.origin_country || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, origin_country: e.target.value })}
                        />
                        <AdminInput 
                            label="Weight" 
                            value={currentProduct?.weight || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, weight: e.target.value })}
                        />
                    </div>
                    <AdminInput 
                        label="Care Instructions" 
                        value={currentProduct?.care_instructions || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, care_instructions: e.target.value })}
                    />
                    <AdminInput 
                        label="Hero Video URL" 
                        placeholder="External link to feature video"
                        value={currentProduct?.hero_video || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, hero_video: e.target.value })}
                    />
                    <AdminInput 
                        label="Editorial Quote" 
                        value={currentProduct?.editorial_quote || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, editorial_quote: e.target.value })}
                    />
                    
                    <AdminImageUpload 
                        label="Product Main Image"
                        preview={currentProduct?.image}
                        onChange={(file: File) => setCurrentProduct({ ...currentProduct, image: file as any })}
                    />
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Additional Images</label>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setCurrentProduct({ ...currentProduct, uploaded_images: Array.from(e.target.files) });
                                    }
                                }}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] text-white/60 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">360° Video Upload</label>
                            <input 
                                type="file" 
                                accept="video/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setCurrentProduct({ ...currentProduct, uploaded_video_360: e.target.files[0] });
                                    }
                                }}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] text-white/60 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>
                    </div>

                    <AdminRichText 
                        label="Description"
                        value={currentProduct?.description || ''}
                        onChange={(content: string) => setCurrentProduct({ ...currentProduct, description: content })}
                    />
                    <AdminRichText 
                        label="Brand Story"
                        value={currentProduct?.story || ''}
                        onChange={(content: string) => setCurrentProduct({ ...currentProduct, story: content })}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Create Product
                    </button>
                </form>
            </AdminModal>

            {/* Edit Product Modal */}
            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Refine Product"
                loading={actionLoading}
            >
                <form onSubmit={handleUpdateProduct} className="space-y-6">
                    <AdminInput 
                        label="Product Name" 
                        value={currentProduct?.name || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                    />
                    <AdminInput 
                        label="Short Description" 
                        value={currentProduct?.short_description || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, short_description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Price (₦)" 
                            type="number"
                            value={currentProduct?.price || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentProduct({ ...currentProduct, price: val ? parseFloat(val) : 0 });
                            }}
                        />
                        <AdminInput 
                            label="Stock Level" 
                            type="number"
                            value={currentProduct?.stock || ''} 
                            onChange={(e) => {
                                const val = e.target.value;
                                setCurrentProduct({ ...currentProduct, stock: val ? parseInt(val) : 0 });
                            }}
                        />
                    </div>
                    <AdminSelect 
                        label="Category"
                        value={currentProduct?.category || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value ? parseInt(e.target.value) : undefined })}
                        options={[
                            { value: '', label: 'Select Category' },
                            ...categories.map(c => ({ value: c.id, label: c.name }))
                        ]}
                    />

                    <AdminSelect 
                        label="Assign Vendor (Curator)"
                        value={currentProduct?.vendor || ''}
                        onChange={(e) => setCurrentProduct({ ...currentProduct, vendor: e.target.value ? parseInt(e.target.value) : undefined })}
                        options={[
                            { value: '', label: 'Select Vendor' },
                            ...vendors.map(v => ({ value: v.id, label: v.brand_name }))
                        ]}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Materials" 
                            value={currentProduct?.materials || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, materials: e.target.value })}
                        />
                        <AdminInput 
                            label="Fit" 
                            value={currentProduct?.fit || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, fit: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput 
                            label="Origin Country" 
                            value={currentProduct?.origin_country || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, origin_country: e.target.value })}
                        />
                        <AdminInput 
                            label="Weight" 
                            value={currentProduct?.weight || ''} 
                            onChange={(e) => setCurrentProduct({ ...currentProduct, weight: e.target.value })}
                        />
                    </div>
                    <AdminInput 
                        label="Care Instructions" 
                        value={currentProduct?.care_instructions || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, care_instructions: e.target.value })}
                    />
                    <AdminInput 
                        label="Hero Video URL" 
                        value={currentProduct?.hero_video || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, hero_video: e.target.value })}
                    />
                    <AdminInput 
                        label="Editorial Quote" 
                        value={currentProduct?.editorial_quote || ''} 
                        onChange={(e) => setCurrentProduct({ ...currentProduct, editorial_quote: e.target.value })}
                    />
                    
                    <AdminImageUpload 
                        label="Product Main Image"
                        preview={currentProduct?.image}
                        onChange={(file: File) => setCurrentProduct({ ...currentProduct, image: file as any })}
                    />
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Additional Images</label>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setCurrentProduct({ ...currentProduct, uploaded_images: Array.from(e.target.files) });
                                    }
                                }}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] text-white/60 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {currentProduct?.images && currentProduct.images.length > 0 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                    {currentProduct.images.map(img => (
                                        <div key={img.id} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
                                            <Image src={img.image.startsWith('http') ? img.image : `${API_BASE_URL}${img.image}`} alt="Additional" fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">360° Video Upload</label>
                            <input 
                                type="file" 
                                accept="video/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setCurrentProduct({ ...currentProduct, uploaded_video_360: e.target.files[0] });
                                    }
                                }}
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[10px] text-white/60 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {currentProduct?.video_360 && (
                                <div className="mt-2 text-[10px] text-white/60">
                                    Current 360 Video: <a href={currentProduct.video_360.video.startsWith('http') ? currentProduct.video_360.video : `${API_BASE_URL}${currentProduct.video_360.video}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">View File</a>
                                </div>
                            )}
                        </div>
                    </div>

                    <AdminRichText 
                        label="Description"
                        value={currentProduct?.description || ''}
                        onChange={(content: string) => setCurrentProduct({ ...currentProduct, description: content })}
                    />
                    <AdminRichText 
                        label="Brand Story"
                        value={currentProduct?.story || ''}
                        onChange={(content: string) => setCurrentProduct({ ...currentProduct, story: content })}
                    />
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Save Improvements
                    </button>
                </form>
            </AdminModal>

            {/* Delete Product Modal */}
            <AdminModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="Remove from Catalog"
                loading={actionLoading}
            >
                <div className="space-y-8">
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                        Are you sure you want to remove <span className="text-white">{currentProduct?.name}</span>? This will hide it from the storefront and curations immediately.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-grow bg-white/5 text-white/40 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                        >
                            Retain
                        </button>
                        <button 
                            onClick={handleDeleteProduct}
                            className="flex-grow bg-red-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                        >
                            Confirm Removal
                        </button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}
