'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Search, Trash2, Edit3, Plus, Tag } from 'lucide-react';
import { safeFetch } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import { AdminModal, AdminInput } from '@/components/admin/AdminForms';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);

    const { notify } = useNotification();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const data = await safeFetch('/admin-api/categories/');
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    }

    async function handleCreateCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!currentCategory?.name) return;
        setActionLoading(true);
        try {
            const newCategory = await safeFetch('/admin-api/categories/', {
                method: 'POST',
                body: JSON.stringify({ name: currentCategory.name, slug: currentCategory.slug || '' }),
                headers: { 'Content-Type': 'application/json' }
            });
            setCategories([newCategory, ...categories]);
            setIsCreateModalOpen(false);
            setCurrentCategory(null);
            notify('success', 'Category Created', `${newCategory.name} has been added successfully.`);
        } catch (error: unknown) {
            notify('error', 'Creation Failed', (error as Error)?.message || "Failed to create category");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdateCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!currentCategory?.id) return;
        setActionLoading(true);
        try {
            const updated = await safeFetch(`/admin-api/categories/${currentCategory.id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ name: currentCategory.name, slug: currentCategory.slug || '' }),
                headers: { 'Content-Type': 'application/json' }
            });
            setCategories(categories.map(c => c.id === updated.id ? updated : c));
            setIsEditModalOpen(false);
            notify('success', 'Category Updated', `${updated.name} has been successfully updated.`);
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || "Failed to update category");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDeleteCategory() {
        if (!currentCategory?.id) return;
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/categories/${currentCategory.id}/`, { method: 'DELETE' });
            setCategories(categories.filter(c => c.id !== currentCategory.id));
            setIsDeleteModalOpen(false);
            notify('success', 'Category Deleted', 'The category has been successfully removed.');
        } catch (error: unknown) {
            notify('error', 'Delete Failed', (error as Error)?.message || "Failed to delete category");
        } finally {
            setActionLoading(false);
        }
    }

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Product Organization</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Categories & <span className="italic opacity-80">Tags.</span></h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-full"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setCurrentCategory({ name: '', slug: '' });
                            setIsCreateModalOpen(true);
                        }}
                        className="bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] transition-all w-full lg:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((category, idx) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all p-4 lg:p-6 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-8 group"
                        >
                            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 shrink-0 text-white/40 group-hover:text-primary transition-colors">
                                <Tags className="w-6 h-6" />
                            </div>

                            <div className="flex-grow min-w-0 w-full lg:w-auto">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-base lg:text-lg font-medium tracking-tight truncate">{category.name}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-[9px] lg:text-[10px] font-bold tracking-[0.1em] uppercase">
                                    <span className="text-white/40 truncate">Slug: {category.slug}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5 justify-end">
                                <button 
                                    onClick={() => {
                                        setCurrentCategory(category);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-white/40 hover:text-white border border-white/5 transition-all"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => {
                                        setCurrentCategory(category);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-red-400/60 hover:text-red-400 border border-white/5 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {filteredCategories.length === 0 && (
                    <div className="p-24 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[40px]">
                        <Tag className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No categories found</p>
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            <AdminModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                title="Assemble Category"
                loading={actionLoading}
            >
                <form onSubmit={handleCreateCategory} className="space-y-6">
                    <AdminInput 
                        label="Category Name" 
                        placeholder="E.g. Outerwear"
                        value={currentCategory?.name || ''} 
                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                    />
                    <AdminInput 
                        label="Slug (optional)" 
                        placeholder="e.g. outerwear"
                        value={currentCategory?.slug || ''} 
                        onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                    />
                    
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Create Category
                    </button>
                </form>
            </AdminModal>

            {/* Edit Category Modal */}
            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Refine Category"
                loading={actionLoading}
            >
                <form onSubmit={handleUpdateCategory} className="space-y-6">
                    <AdminInput 
                        label="Category Name" 
                        value={currentCategory?.name || ''} 
                        onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                    />
                    <AdminInput 
                        label="Slug" 
                        value={currentCategory?.slug || ''} 
                        onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
                    />
                    
                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        Save Improvements
                    </button>
                </form>
            </AdminModal>

            {/* Delete Category Modal */}
            <AdminModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="Remove from Catalog"
                loading={actionLoading}
            >
                <div className="space-y-8">
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                        Are you sure you want to remove <span className="text-white">{currentCategory?.name}</span>? This could orphan products if they do not have fallback categories.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-grow bg-white/5 text-white/40 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                        >
                            Retain
                        </button>
                        <button 
                            onClick={handleDeleteCategory}
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
