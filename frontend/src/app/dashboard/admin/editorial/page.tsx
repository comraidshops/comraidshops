'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
    FileText, BookOpen, Presentation, 
    Layers, Plus, Star, Search,
    Edit3, Trash2
} from 'lucide-react';
import { safeFetch, API_BASE_URL } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import Image from 'next/image';
import { AdminModal, AdminInput, AdminTextArea, AdminSelect, AdminRichText, AdminImageUpload, AdminMultiSelect, AdminGalleryManager } from '@/components/admin/AdminForms';

type EditorialType = 'magazines' | 'articles' | 'exhibitions' | 'collections' | 'slides' | 'fitframes' | 'brands';

interface EditorialBase {
    id: number;
    title?: string;
    name?: string;
    slug?: string;
    created_at: string;

    cover_image?: string | File | null;
    image?: string | File | null;
    thumbnail?: string | File | null;
    hero_image?: string | File | null;
    preview_image?: string | File | null;
    logo?: string | File | null;
    founder_image?: string | File | null;
    is_featured?: boolean;
    is_active?: boolean;
    order?: number;
    description?: string;
    content?: string;
    tagline?: string;
    philosophy?: string;
    founder_name?: string;
    founder_bio?: string;
    established_year?: number | null;
    origin_country?: string;
    website?: string;
    season?: string;
    magazine?: number | null;
    article?: { content: string };
    video_url?: string;
    video_file?: string | File | null;
    video_provider?: string;
    video_thumbnail?: string;
    items?: { id: number; label: string; product: { id: number; name: string } }[];
    
    // Exhibition nested fields
    products?: { id: number; name: string }[];
    collections?: { id: number; name: string }[];
    magazines?: { id: number; title: string }[];
    articles?: { id: number; title: string }[];
    linked_articles?: { id: number; title: string }[];
    product_ids?: number[];
    collection_ids?: number[];
    magazine_ids?: number[];
    article_ids?: number[];
    linked_article_ids?: number[];
    gallery?: { id?: number; image: string | File; caption?: string; order: number }[];
    visibility?: boolean;
    brand?: number | null;
    meta_title?: string;
    meta_description?: string;
    manifesto?: string;
    story?: string;
    featured_quote?: string;
}
interface MagazineOption {
    id: number;
    title: string;
}

function EditorialContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams?.get('tab') as EditorialType;

    const [activeTab, setActiveTab] = useState<EditorialType>(tabParam || 'magazines');
    const [items, setItems] = useState<EditorialBase[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab: EditorialType) => {
        setActiveTab(tab);
        router.push(`/dashboard/admin/editorial?tab=${tab}`);
    };

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<EditorialBase> | null>(null);

    // Helpers for Articles/Exhibitions
    const [magazines, setMagazines] = useState<MagazineOption[]>([]);
    const [products, setProducts] = useState<{id: number, name: string}[]>([]);
    const [collections, setCollections] = useState<{id: number, name: string}[]>([]);
    const [articles, setArticles] = useState<{id: number, title: string}[]>([]);
    const [brands, setBrands] = useState<{id: number, name: string}[]>([]);

    const { notify } = useNotification();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const data = await safeFetch(`/admin-api/${activeTab}/`);
                setItems(data);
            } catch (error) {
                console.error(`Failed to fetch ${activeTab}:`, error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchMagazines() {
            try {
                const data = await safeFetch('/admin-api/magazines/');
                setMagazines(data);
            } catch {}
        }

        async function fetchExhibitionDeps() {
            try {
                const [prods, cols, arts, brnds] = await Promise.all([
                    safeFetch('/admin-api/products/'),
                    safeFetch('/admin-api/collections/'),
                    safeFetch('/admin-api/articles/'),
                    safeFetch('/admin-api/brands/')
                ]);
                setProducts(prods);
                setCollections(cols);
                setArticles(arts);
                setBrands(brnds);
            } catch {}
        }

        fetchData();
        if (activeTab === 'articles' || activeTab === 'exhibitions' || activeTab === 'magazines') fetchMagazines();
        if (activeTab === 'exhibitions' || activeTab === 'magazines' || activeTab === 'collections') fetchExhibitionDeps();
    }, [activeTab]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!currentItem) return;
        setActionLoading(true);
        try {
            const formData = new FormData();
            // Keys that are handled separately or are read-only nested data
            const skipKeys = ['gallery', 'products', 'collections', 'magazines', 'articles', 'linked_articles', 'items'];

            Object.entries(currentItem).forEach(([key, val]) => {
                let finalKey = key;
                if (activeTab === 'magazines' && key === 'content') {
                    finalKey = 'article_content';
                }
                
                // Skip keys handled separately
                if (skipKeys.includes(key)) return;

                // For articles, "name" entered by user is purely labels for this UI, 
                // backend requires "magazine" and "content".
                if (activeTab === 'articles' && key === 'name') return;

                if (Array.isArray(val) && key.endsWith('_ids')) {
                    if (val.length === 0) {
                        formData.append(finalKey, '');
                    } else {
                        val.forEach(v => formData.append(finalKey, v.toString()));
                    }
                } else if (val !== null && val !== undefined && !Array.isArray(val)) {
                    if (typeof val === 'object' && !(val instanceof File) && !(val instanceof Blob)) {
                        formData.append(finalKey, JSON.stringify(val));
                    } else {
                        formData.append(finalKey, val as string | Blob);
                    }
                }
            });

            // Handle Gallery Images separately for collections (manifest protocol)
            if (activeTab === 'collections' || activeTab === 'brands') {
                const gallery = currentItem.gallery || [];
                formData.append('gallery_count', String(gallery.length));
                gallery.forEach((g, idx) => {
                    formData.append(`gallery_caption_${idx}`, g.caption || '');
                    formData.append(`gallery_order_${idx}`, String(g.order));
                    if (typeof g.image === 'string' && g.id) {
                        // Existing image already in DB
                        formData.append(`gallery_type_${idx}`, 'existing');
                        formData.append(`gallery_existing_id_${idx}`, String(g.id));
                    } else if (g.image && typeof g.image !== 'string') {
                        // Newly added image
                        formData.append(`gallery_type_${idx}`, 'new');
                        formData.append(`gallery_image_${idx}`, g.image as Blob);
                    }
                });
            }


            // Explicit validation for Articles: Magazine ID is REQUIRED
            if (activeTab === 'articles' && !formData.has('magazine')) {
                throw new Error("Please select a Magazine for this article.");
            }

            // Explicit validation for Collections: Brand ID is REQUIRED
            if (activeTab === 'collections' && !formData.has('brand')) {
                throw new Error("Please select a Brand for this collection.");
            }


            const newItem = await safeFetch(`/admin-api/${activeTab}/`, {
                method: 'POST',
                body: formData
            });
            setItems([newItem, ...items]);
            setIsCreateModalOpen(false);
            setCurrentItem(null);
            notify('success', `${activeTab.slice(0, -1)} Created`, 'Item has been successfully published.');
        } catch (error: unknown) {
            console.error("Creation Error:", error);
            notify('error', 'Creation Failed', (error as Error)?.message || "Failed to create item");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        if (!currentItem?.id) return;
        setActionLoading(true);
        try {
            const formData = new FormData();
            const skipKeys = ['gallery', 'products', 'collections', 'magazines', 'articles', 'linked_articles', 'items'];

            Object.entries(currentItem).forEach(([key, val]) => {
                let finalKey = key;
                if (activeTab === 'magazines' && key === 'content') {
                    finalKey = 'article_content';
                }

                // Skip keys handled separately
                if (skipKeys.includes(key)) return;

                if (Array.isArray(val) && key.endsWith('_ids')) {
                    if (val.length === 0) {
                        formData.append(finalKey, '');
                    } else {
                        val.forEach(v => formData.append(finalKey, v.toString()));
                    }
                } else if (val && (val as any) instanceof File) {
                    formData.append(finalKey, val as any);
                } else if (val !== undefined && !Array.isArray(val)) {
                    const isImageUrl = typeof val === 'string' && (val.startsWith('http') || val.startsWith('/media/'));
                    const isSpecialField = finalKey === 'article_content' || finalKey === 'video_url';

                    if (isSpecialField || (!isImageUrl && finalKey !== 'id')) {
                        if (typeof val === 'object' && val !== null && !(val instanceof Blob)) {
                            formData.append(finalKey, JSON.stringify(val));
                        } else {
                            formData.append(finalKey, val === null ? '' : (val as string | Blob));
                        }
                    }
                }
            });

            // Handle Gallery Images separately for collections (manifest protocol)
            if (activeTab === 'collections' || activeTab === 'brands') {
                const gallery = currentItem.gallery || [];
                formData.append('gallery_count', String(gallery.length));
                gallery.forEach((g, idx) => {
                    formData.append(`gallery_caption_${idx}`, g.caption || '');
                    formData.append(`gallery_order_${idx}`, String(g.order));
                    if (typeof g.image === 'string' && g.id) {
                        // Existing image already in DB
                        formData.append(`gallery_type_${idx}`, 'existing');
                        formData.append(`gallery_existing_id_${idx}`, String(g.id));
                    } else if (g.image && typeof g.image !== 'string') {
                        // Newly added image
                        formData.append(`gallery_type_${idx}`, 'new');
                        formData.append(`gallery_image_${idx}`, g.image as Blob);
                    }
                });
            }


            const updated = await safeFetch(`/admin-api/${activeTab}/${currentItem.id}/`, {
                method: 'PATCH',
                body: formData
            });
            setItems(items.map(i => i.id === updated.id ? updated : i));
            setIsEditModalOpen(false);
            notify('success', `${activeTab.slice(0, -1)} Updated`, 'Changes have been saved successfully.');
        } catch (error: unknown) {
            notify('error', 'Update Failed', (error as Error)?.message || "Failed to update item");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleDelete() {
        if (!currentItem?.id) return;
        setActionLoading(true);
        try {
            await safeFetch(`/admin-api/${activeTab}/${currentItem.id}/`, { method: 'DELETE' });
            setItems(items.filter(i => i.id !== currentItem.id));
            setIsDeleteModalOpen(false);
            notify('success', `${activeTab.slice(0, -1)} Archived`, 'Item has been successfully removed.');
        } catch (error: unknown) {
            notify('error', 'Delete Failed', (error as Error)?.message || "Failed to delete item");
        } finally {
            setActionLoading(false);
        }
    }

    async function toggleStatus(item: EditorialBase, customField?: string) {
        const field = customField || (activeTab === 'slides' ? 'is_active' : 'is_featured');
        const currentValue = (item as any)[field];

        try {
            await safeFetch(`/admin-api/${activeTab}/${item.id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ [field]: !currentValue })
            });
            setItems(items.map(i => i.id === item.id ? { ...i, [field]: !currentValue } : i));
            notify('success', 'Status Updated', `${field} is now ${!currentValue ? 'Active' : 'Inactive'}.`);
        } catch (error: unknown) {
            notify('error', 'Toggle Failed', (error as Error)?.message || "Failed to toggle status");
        }
    }

    const filteredItems = items.filter(item => {
        const title = item.title || item.name || (activeTab === 'slides' ? `Slide #${item.order}` : '');
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const tabs = [
        { id: 'magazines', label: 'Magazines', icon: BookOpen },
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'exhibitions', label: 'Exhibitions', icon: Presentation },
        { id: 'collections', label: 'Collections', icon: Layers },
        { id: 'slides', label: 'Hero Slides', icon: Layers },
        { id: 'fitframes', label: 'FitFrames', icon: Layers },
        { id: 'brands', label: 'Brands', icon: Star },
    ];

    return (
        <div className="space-y-8 lg:space-y-12">
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 lg:mb-4 block">Curation Hub</span>
                    <h1 className="text-4xl lg:text-5xl font-playfair font-medium tracking-tight">Editorial <span className="italic opacity-80">Director.</span></h1>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-full lg:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all w-full"
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setCurrentItem({ is_featured: false, is_active: true });
                            setIsCreateModalOpen(true);
                        }}
                        className="bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-[1.02] transition-all w-full lg:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Create {activeTab.slice(0, -1)}
                    </button>
                </div>
            </header>

            <div className="flex gap-6 lg:gap-8 border-b border-white/5 pb-6 lg:pb-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as EditorialType)}
                            className={`flex items-center gap-3 lg:gap-4 px-2 lg:px-4 py-4 transition-all relative shrink-0 ${
                                isActive ? 'text-primary' : 'text-white/40 hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                            {isActive && (
                                <motion.div 
                                    layoutId="tab-underline"
                                    className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_#ccf381]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => {
                        const title = item.title || item.name || (activeTab === 'slides' ? `Hero Slide #${item.order}` : 'Untitled');
                        const thumb = item.preview_image || item.thumbnail || item.image || item.cover_image || item.logo || item.hero_image || '/images/placeholder-editorial.jpg';
                        const statusActive = activeTab === 'slides' ? item.is_active : item.is_featured;
                        
                        return (
                            <motion.div
                                key={`${activeTab}-${item.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
                            >
                                <div className="aspect-[16/10] relative overflow-hidden">
                                    <Image 
                                        src={typeof thumb === 'string' 
                                            ? (thumb.startsWith('http') || thumb.startsWith('data:') || thumb.startsWith('/') ? thumb : `${API_BASE_URL}${thumb}`)
                                            : (thumb instanceof File && typeof window !== 'undefined' ? URL.createObjectURL(thumb) : '/images/placeholder-editorial.jpg')
                                        } 
                                        alt={title} 
                                        fill 
                                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                    
                                    <div className="absolute top-4 lg:top-6 right-4 lg:right-6 flex gap-2">
                                        <button 
                                            onClick={() => toggleStatus(item)}
                                            className={`p-2.5 lg:p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all ${
                                                statusActive ? 'bg-primary text-black' : 'bg-black/40 text-white hover:bg-white/10'
                                            }`}
                                        >
                                            <Star className="w-4 h-4" fill={statusActive ? "currentColor" : "none"} />
                                        </button>
                                        {activeTab === 'brands' && (
                                            <button 
                                                onClick={() => toggleStatus(item, 'visibility')}
                                                className={`p-2.5 lg:p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all ${
                                                    item.visibility ? 'bg-blue-500 text-white' : 'bg-black/40 text-white/40 hover:bg-white/10'
                                                }`}
                                                title={item.visibility ? "Publicly Visible" : "Hidden from Public"}
                                            >
                                                <Star className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 lg:p-8">
                                    <h3 className="text-lg lg:text-xl font-medium tracking-tight mb-4 group-hover:text-primary transition-colors truncate">{title}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 lg:gap-4 text-[8px] font-bold uppercase tracking-widest text-white/40">
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-white/20 truncate max-w-[80px]">{item.slug}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    const editItem = { ...item };
                                                    if (activeTab === 'magazines') {
                                                        const m = item as any;
                                                        if (m.articles && m.articles.length > 0) {
                                                            editItem.content = m.articles[0].content;
                                                        }
                                                        editItem.linked_article_ids = m.linked_articles?.map((a: any) => a.id) || [];
                                                    }
                                                    if (activeTab === 'exhibitions' || activeTab === 'fitframes' || activeTab === 'articles') {
                                                        editItem.product_ids = item.items?.map((i: any) => i.product.id) || item.products?.map((p: any) => p.id) || [];
                                                        if (activeTab === 'exhibitions') {
                                                            editItem.collection_ids = item.collections?.map((c: any) => c.id) || [];
                                                            editItem.magazine_ids = item.magazines?.map((m: any) => m.id) || [];
                                                            editItem.article_ids = item.articles?.map((a: any) => a.id) || [];
                                                        }
                                                    }
                                                    setCurrentItem(editItem);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setCurrentItem(item);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="p-2.5 lg:p-3 rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                
                {filteredItems.length === 0 && !loading && (
                    <div className="col-span-full p-24 text-center border border-dashed border-white/5 rounded-[40px]">
                        <Layers className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">No items found in {activeTab}</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AdminModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setCurrentItem(null);
                }}
                title={`${isCreateModalOpen ? 'New' : 'Edit'} ${activeTab.slice(0, -1)}`}
                loading={actionLoading}
            >
                <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6">
                    <AdminInput 
                        label={activeTab === 'slides' ? 'Main Text' : (activeTab === 'magazines' ? 'Title' : (activeTab === 'brands' ? 'Brand Name' : 'Name'))}
                        value={(activeTab === 'magazines' || activeTab === 'articles' ? currentItem?.title : currentItem?.name) || ''} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value;
                            if (activeTab === 'magazines') {
                                setCurrentItem({ ...currentItem, title: val });
                            } else if (activeTab === 'brands') {
                                setCurrentItem({ ...currentItem, name: val });
                            } else {
                                setCurrentItem({ ...currentItem, name: val });
                            }
                        }}
                    />
                    
                    {activeTab === 'magazines' && (
                        <>
                            <AdminRichText 
                                label="Magazine Article Content"
                                value={currentItem?.content || ''}
                                onChange={(content: string) => setCurrentItem({ ...currentItem, content: content })}
                            />
                            <AdminMultiSelect 
                                label="Linked Articles (Editorial Context)"
                                options={articles.map(a => ({ value: a.id, label: a.title }))}
                                value={currentItem?.linked_article_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, linked_article_ids: vals as number[] })}
                            />
                        </>
                    )}

                    {activeTab !== 'brands' && (
                        <AdminImageUpload 
                            label={
                                activeTab === 'magazines' ? 'Thumbnail' : 
                                (activeTab === 'articles' || activeTab === 'slides' ? 'Image' : 
                                (activeTab === 'exhibitions' || activeTab === 'fitframes' ? 'Cover Image' : 'Hero Image'))
                            }
                            preview={
                                currentItem?.thumbnail || currentItem?.image || currentItem?.cover_image || currentItem?.hero_image || undefined
                            }
                            onChange={(file: File) => setCurrentItem({ 
                                ...currentItem, 
                                [activeTab === 'magazines' || activeTab === 'exhibitions' ? 'thumbnail' : 
                                 (activeTab === 'articles' || activeTab === 'slides' ? 'image' : 
                                 (activeTab === 'fitframes' ? 'cover_image' : 
                                 (activeTab === 'collections' ? 'hero_image' : 'hero_image')))]: file as File
                            })}
                        />
                    )}

                    {activeTab === 'collections' && (
                        <AdminImageUpload 
                            label="Preview Image"
                            preview={currentItem?.preview_image || undefined}
                            onChange={(file: File) => setCurrentItem({ ...currentItem, preview_image: file as File })}
                        />
                    )}

                    {activeTab === 'articles' && (
                        <>
                            <AdminInput 
                                label="Article Title"
                                placeholder="Enter article title (optional, will use magazine title if blank)"
                                value={currentItem?.title || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, title: e.target.value })}
                            />
                            <AdminSelect 
                                label="Magazine"
                                value={currentItem?.magazine || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentItem({ ...currentItem, magazine: parseInt(e.target.value) })}
                                options={[
                                    { value: '', label: 'Select Magazine' },
                                    ...magazines.map(m => ({ value: m.id, label: m.title }))
                                ]}
                            />
                        </>
                    )}

                    {activeTab === 'collections' && (
                        <>
                            <AdminSelect 
                                label="Brand"
                                value={currentItem?.brand || ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentItem({ ...currentItem, brand: parseInt(e.target.value) })}
                                options={[
                                    { value: '', label: 'Select Brand' },
                                    ...brands.map(b => ({ value: b.id, label: b.name }))
                                ]}
                            />
                            <AdminInput 
                                label="Season"
                                placeholder="e.g. Spring/Summer 2026"
                                value={currentItem?.season || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, season: e.target.value })}
                            />
                            <AdminTextArea 
                                label="Description"
                                value={currentItem?.description || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                            />
                            <AdminInput 
                                label="Display Order"
                                type="number"
                                value={currentItem?.order || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) || 0 })}
                            />
                            <AdminGalleryManager 
                                images={currentItem?.gallery}
                                onChange={(imgs) => setCurrentItem({ ...currentItem, gallery: imgs })}
                            />
                            <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">SEO Optimization</h4>
                                <AdminInput 
                                    label="Meta Title"
                                    placeholder="SEO override title"
                                    value={currentItem?.meta_title || ''}
                                    onChange={(e) => setCurrentItem({ ...currentItem, meta_title: e.target.value })}
                                />
                                <AdminTextArea 
                                    label="Meta Description"
                                    value={currentItem?.meta_description || ''}
                                    onChange={(e) => setCurrentItem({ ...currentItem, meta_description: e.target.value })}
                                />
                            </div>
                        </>
                    )}


                    {activeTab === 'articles' && (
                        <>
                            <AdminRichText 
                                label="Article Content"
                                value={currentItem?.content || ''}
                                onChange={(content: string) => setCurrentItem({ ...currentItem, content: content })}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AdminInput 
                                    label="Video URL (YouTube/Vimeo)"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={currentItem?.video_url || ''}
                                    onChange={(e) => setCurrentItem({ ...currentItem, video_url: e.target.value })}
                                />
                                <div className="space-y-2 mb-6">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Direct Video Upload</label>
                                    <input 
                                        type="file" 
                                        accept="video/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setCurrentItem({ ...currentItem, video_file: file });
                                        }}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 px-6 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all text-white file:bg-primary file:text-black file:border-0 file:rounded-xl file:px-4 file:py-1 file:mr-4 file:text-[8px] file:font-black file:uppercase file:cursor-pointer"
                                    />
                                    {currentItem?.video_url && currentItem.video_url.includes('cloudinary') && (
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-primary/60 px-2 italic">Video is hosted on Cloudinary</p>
                                    )}
                                </div>
                            </div>
                            <AdminMultiSelect 
                                label="Linked Products"
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                value={currentItem?.product_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, product_ids: vals as number[] })}
                            />
                        </>
                    )}

                    {activeTab === 'brands' && (
                        <div className="space-y-6">
                            <AdminInput label="Tagline" value={currentItem?.tagline || ''} onChange={(e) => setCurrentItem({ ...currentItem, tagline: e.target.value })} />
                            <AdminTextArea label="Description" value={currentItem?.description || ''} onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })} />
                            
                            <div className="py-6 border-y border-white/5 my-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Brand Narrative</h4>
                                <div className="space-y-6">
                                    <AdminRichText label="Brand Story" value={currentItem?.story || ''} onChange={(val) => setCurrentItem({ ...currentItem, story: val })} />
                                    <AdminRichText label="Manifesto" value={currentItem?.manifesto || ''} onChange={(val) => setCurrentItem({ ...currentItem, manifesto: val })} />
                                    <AdminTextArea label="Featured Quote" value={currentItem?.featured_quote || ''} onChange={(e) => setCurrentItem({ ...currentItem, featured_quote: e.target.value })} />
                                    <AdminRichText label="Philosophy" value={currentItem?.philosophy || ''} onChange={(val) => setCurrentItem({ ...currentItem, philosophy: val })} />
                                </div>
                            </div>

                            <AdminInput label="Founder Name" value={currentItem?.founder_name || ''} onChange={(e) => setCurrentItem({ ...currentItem, founder_name: e.target.value })} />
                            <AdminTextArea label="Founder Bio" value={currentItem?.founder_bio || ''} onChange={(e) => setCurrentItem({ ...currentItem, founder_bio: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <AdminInput 
                                    label="Established Year" 
                                    type="number" 
                                    value={currentItem?.established_year || ''} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCurrentItem({ ...currentItem, established_year: val === '' ? null : parseInt(val) });
                                    }} 
                                />
                                <AdminInput label="Origin Country" value={currentItem?.origin_country || ''} onChange={(e) => setCurrentItem({ ...currentItem, origin_country: e.target.value })} />
                            </div>
                            <AdminInput label="Website" value={currentItem?.website || ''} onChange={(e) => setCurrentItem({ ...currentItem, website: e.target.value })} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-white/5 mt-6">
                                <AdminImageUpload 
                                    label="Brand Logo"
                                    preview={currentItem?.logo || undefined}
                                    onChange={(file: File) => setCurrentItem({ ...currentItem, logo: file as File })}
                                />
                                <AdminImageUpload 
                                    label="Founder Image"
                                    preview={currentItem?.founder_image || undefined}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    onChange={(file: File) => setCurrentItem({ ...currentItem, founder_image: file as any })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5 mb-6">
                                <AdminImageUpload 
                                    label="Hero Image"
                                    preview={currentItem?.hero_image || undefined}
                                    onChange={(file: File) => setCurrentItem({ ...currentItem, hero_image: file as File })}
                                />
                                <AdminImageUpload 
                                    label="Preview Image"
                                    preview={currentItem?.preview_image || undefined}
                                    onChange={(file: File) => setCurrentItem({ ...currentItem, preview_image: file as File })}
                                />
                            </div>

                            <div className="space-y-4 pt-4 pb-6 border-b border-white/5 mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Brand Archives</h4>
                                <AdminGalleryManager 
                                    images={currentItem?.gallery}
                                    onChange={(imgs) => setCurrentItem({ ...currentItem, gallery: imgs })}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">SEO Optimization</h4>
                                <AdminInput label="Meta Title" value={currentItem?.meta_title || ''} onChange={(e) => setCurrentItem({ ...currentItem, meta_title: e.target.value })} />
                                <AdminTextArea label="Meta Description" value={currentItem?.meta_description || ''} onChange={(e) => setCurrentItem({ ...currentItem, meta_description: e.target.value })} />
                            </div>
                        </div>
                    )}
                    
                    {(activeTab === 'exhibitions' || activeTab === 'fitframes') && (
                        <>
                            <AdminRichText 
                                label="Exhibition Narrative (Description)"
                                value={currentItem?.description || ''}
                                onChange={(val: string) => setCurrentItem({ ...currentItem, description: val })}
                            />
                            
                            <AdminRichText 
                                label="Curator's Note"
                                value={currentItem?.curator_note || ''}
                                onChange={(val: string) => setCurrentItem({ ...currentItem, curator_note: val })}
                            />
                            
                            <AdminMultiSelect 
                                label="Linked Products"
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                value={currentItem?.product_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, product_ids: vals as number[] })}
                            />
                        </>
                    )}

                    {activeTab === 'exhibitions' && (
                        <>
                            <AdminMultiSelect 
                                label="Linked Products"
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                value={currentItem?.product_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, product_ids: vals as number[] })}
                            />
                            <AdminMultiSelect 
                                label="Linked Collections"
                                options={collections.map(c => ({ value: c.id, label: c.name }))}
                                value={currentItem?.collection_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, collection_ids: vals as number[] })}
                            />
                            <AdminMultiSelect 
                                label="Linked Magazines"
                                options={magazines.map(m => ({ value: m.id, label: m.title }))}
                                value={currentItem?.magazine_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, magazine_ids: vals as number[] })}
                            />
                            <AdminMultiSelect 
                                label="Linked Articles"
                                options={articles.map(a => ({ value: a.id, label: a.title }))}
                                value={currentItem?.article_ids || []}
                                onChange={(vals) => setCurrentItem({ ...currentItem, article_ids: vals as number[] })}
                            />
                        </>
                    )}

                    {activeTab === 'slides' && (
                        <AdminInput 
                            label="Display Order"
                            type="number"
                            value={currentItem?.order || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentItem({ ...currentItem, order: parseInt(e.target.value) })}
                        />
                    )}

                    <button 
                        type="submit"
                        className="w-full bg-primary text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all"
                    >
                        {isCreateModalOpen ? 'Publish Content' : 'Save Changes'}
                    </button>
                </form>
            </AdminModal>

            {/* Delete Confirmation */}
            <AdminModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="Archive Request"
                loading={actionLoading}
            >
                <div className="space-y-8">
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-widest">
                        Are you certain you wish to archive this {activeTab.slice(0, -1)}? It will be removed from all public viewpoints immediately.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-grow bg-white/5 text-white/40 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex-grow bg-red-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
}

// Add these helpers
function currentProductLabel() {
    // CurrentItem helper to avoid too many ternaries
    return ''; // Placeholder, the above logic is inline now
}

export default function AdminEditorial() {
    return (
        <Suspense fallback={<div className="p-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Initializing Director...</div>}>
            <EditorialContent />
        </Suspense>
    );
}
