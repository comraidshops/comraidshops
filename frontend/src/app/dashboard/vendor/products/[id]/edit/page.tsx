'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Plus, Trash2, Settings } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types/brand';
import { ImageCropperModal } from '@/components/ui/ImageCropperModal';
import { safeFetch } from '@/lib/api';

interface Variant {
  name: string;
  stock: string | number;
}

interface Specification {
  name: string;
  value: string;
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams() as { id: string };
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [commissionRate, setCommissionRate] = useState<number>(0);
    const [globalCommissionMode, setGlobalCommissionMode] = useState<'fixed' | 'percentage'>('percentage');
    const [globalCommissionValue, setGlobalCommissionValue] = useState<number>(0);

    const [variants, setVariants] = useState<Variant[]>([]);
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);

    const addVariant = () => setVariants([...variants, { name: '', stock: '' }]);
    const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const next = [...variants];
        next[index] = { ...next[index], [field]: value as never };
        setVariants(next);
    };

    const addSpec = () => setSpecifications([...specifications, { name: '', value: '' }]);
    const removeSpec = (index: number) => setSpecifications(specifications.filter((_, i) => i !== index));
    const updateSpec = (index: number, field: keyof Specification, value: string) => {
        const next = [...specifications];
        next[index] = { ...next[index], [field]: value };
        setSpecifications(next);
    };
    
    const toggleDeleteImage = (id: number) => {
        setDeletedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Image Cropper State
    const [isCroppingMain, setIsCroppingMain] = useState(false);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [croppedMainFile, setCroppedMainFile] = useState<File | null>(null);
    const [mainPreviewUrl, setMainPreviewUrl] = useState('');

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCroppedMainFile(file); // Store temporary to retain name
            setMainImageUrl(URL.createObjectURL(file));
            setIsCroppingMain(true);
        }
        e.target.value = ''; // Reset to allow re-selection
    };

    const handleMainCropComplete = (croppedBlob: Blob) => {
        if (!croppedMainFile) return;
        const finalFile = new File([croppedBlob], croppedMainFile.name, { type: 'image/jpeg' });
        setCroppedMainFile(finalFile);
        setMainPreviewUrl(URL.createObjectURL(croppedBlob));
        setIsCroppingMain(false);
    };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard metrics to get commission rate
        const dashData = await safeFetch('/vendor/dashboard/');
        if (dashData && dashData.commission_rate) {
          setCommissionRate(Number(dashData.commission_rate));
        }

        const data = await safeFetch(`/vendor/products/${id}/`);
        if (data) {
          setProduct(data);
          
          if (data.variants && Array.isArray(data.variants)) {
            setVariants(data.variants.map((v: any) => ({ name: v.name, stock: v.stock })));
          }
          if (data.specifications && Array.isArray(data.specifications)) {
            setSpecifications(data.specifications.map((s: any) => ({ name: s.name, value: s.value })));
          }
        } else {
          setError("Failed to fetch product details.");
        }
      } catch {
        setError('Error fetching product');
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
    formData.set('price', listingPrice.toFixed(2));

    if (croppedMainFile) {
      formData.set('image', croppedMainFile);
    } else {
      const imageFile = formData.get('image') as File | null;
      if (!imageFile || imageFile.size === 0) {
        formData.delete('image');
      }
    }

    const uploadedImages = formData.getAll('uploaded_images') as File[];
    if (uploadedImages.length === 1 && uploadedImages[0].size === 0) {
      formData.delete('uploaded_images');
    }

    const video360File = formData.get('uploaded_video_360') as File | null;
    if (!video360File || video360File.size === 0) {
      formData.delete('uploaded_video_360');
    }

    formData.append('variants', JSON.stringify(variants));
    formData.append('specifications', JSON.stringify(specifications));

    formData.append('deleted_images', JSON.stringify(deletedImages));

    try {
      await safeFetch(`/vendor/products/${id}/`, {
        method: 'PUT',
        body: formData,
      });
      router.push('/dashboard/vendor/products');
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
            <span className="text-xl font-bold tracking-tighter">₦{Number(currentPrice).toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="short_description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Short Description</label>
          <input type="text" id="short_description" name="short_description" defaultValue={product.short_description || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" maxLength={300} />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-secondary">Description</label>
          <textarea id="description" name="description" rows={5} defaultValue={product.description} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="story" className="block text-xs font-bold uppercase tracking-widest text-secondary">Full Brand Story</label>
          <textarea id="story" name="story" rows={5} defaultValue={product.story || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="materials" className="block text-xs font-bold uppercase tracking-widest text-secondary">Materials</label>
            <input type="text" id="materials" name="materials" defaultValue={product.materials || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
          <div className="space-y-2">
            <label htmlFor="fit" className="block text-xs font-bold uppercase tracking-widest text-secondary">Fit & Sizing</label>
            <input type="text" id="fit" name="fit" defaultValue={product.fit || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="origin_country" className="block text-xs font-bold uppercase tracking-widest text-secondary">Origin Country</label>
            <input type="text" id="origin_country" name="origin_country" defaultValue={product.origin_country || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
          <div className="space-y-2">
            <label htmlFor="weight" className="block text-xs font-bold uppercase tracking-widest text-secondary">Weight</label>
            <input type="text" id="weight" name="weight" defaultValue={product.weight || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="care_instructions" className="block text-xs font-bold uppercase tracking-widest text-secondary">Care Instructions</label>
          <input type="text" id="care_instructions" name="care_instructions" defaultValue={product.care_instructions || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label htmlFor="hero_video" className="block text-xs font-bold uppercase tracking-widest text-secondary">Hero Video URL</label>
            <input type="url" id="hero_video" name="hero_video" defaultValue={product.hero_video || ''} placeholder="https://youtube.com/..." className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
          <div className="space-y-2">
            <label htmlFor="editorial_quote" className="block text-xs font-bold uppercase tracking-widest text-secondary">Editorial Quote</label>
            <input type="text" id="editorial_quote" name="editorial_quote" defaultValue={product.editorial_quote || ''} className="w-full bg-secondary/5 border border-border p-3 focus:outline-none focus:border-primary transition-colors h-12" />
          </div>
        </div>

        {/* Technical Specs & Variants */}
        <section className="space-y-8 bg-background border border-border p-8 mt-8 mb-8">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Technical Specs & Variants</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
        </section>

        <div className="space-y-4">
          <label htmlFor="image" className="block text-xs font-bold uppercase tracking-widest text-secondary">Main Campaign Image</label>
          {(mainPreviewUrl || product.image) && (
            <div className="relative w-24 h-32 bg-secondary/10 border border-border overflow-hidden">
               <Image 
                 src={mainPreviewUrl ? mainPreviewUrl : (product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`)}
                 alt="Current product image" 
                 fill
                 className="object-cover" 
               />
            </div>
          )}
          <input type="file" id="image" name="image" accept="image/*" onChange={handleMainImageChange} className="w-full border border-border p-3 bg-secondary/5 focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">Leaving blank keeps current main image.</p>
        </div>

        {isCroppingMain && (
          <ImageCropperModal
            isOpen={isCroppingMain}
            onClose={() => setIsCroppingMain(false)}
            imageUrl={mainImageUrl}
            onCropComplete={handleMainCropComplete}
            aspectRatio={4 / 5}
          />
        )}

        <div className="space-y-4">
          <label htmlFor="uploaded_images" className="block text-xs font-bold uppercase tracking-widest text-secondary">Additional Gallery Images</label>
          {product.images && product.images.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
              {product.images.map(img => (
                <div key={img.id} className="relative group/img shrink-0">
                  <div className={`relative w-20 h-28 bg-secondary/10 border ${deletedImages.includes(img.id) ? 'border-red-500 opacity-50' : 'border-border'}`}>
                    <Image src={img.image.startsWith('http') ? img.image : `${process.env.NEXT_PUBLIC_API_URL}${img.image}`} alt="Gallery image" fill className="object-cover" />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => toggleDeleteImage(img.id)}
                    className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-transform hover:scale-110 ${deletedImages.includes(img.id) ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {deletedImages.includes(img.id) ? <Plus className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}
          <input type="file" id="uploaded_images" name="uploaded_images" accept="image/*" multiple className="w-full border border-border p-3 bg-secondary/5 focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">New images will be appended to the existing gallery. Use the buttons above to remove images.</p>
        </div>

        <div className="space-y-4">
          <label htmlFor="uploaded_video_360" className="block text-xs font-bold uppercase tracking-widest text-secondary">360° Video Upload</label>
          {product.video_360 && (
            <div className="text-xs font-bold">
               <span className="text-secondary mr-2">Current Video:</span> 
               {/* 
                 Depending on the API format, video_360 can be a string URL or nested object. 
                 Using { video?: string } to safely read .video or pure string. 
               */}
               <a href={typeof product.video_360 === 'string' ? `${process.env.NEXT_PUBLIC_API_URL}${product.video_360}` : (product.video_360 as { video?: string })?.video?.startsWith('http') ? (product.video_360 as { video?: string }).video : `${process.env.NEXT_PUBLIC_API_URL}${(product.video_360 as { video?: string })?.video}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">View 360 Video</a>
            </div>
          )}
          <input type="file" id="uploaded_video_360" name="uploaded_video_360" accept="video/*" className="w-full border border-border p-3 bg-secondary/5 focus:outline-none focus:border-primary transition-colors" />
          <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">Leaving blank keeps current video.</p>
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

