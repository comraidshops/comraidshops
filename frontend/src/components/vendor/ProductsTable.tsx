import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit2, ExternalLink, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

export interface Product {
    id: number;
    name: string;
    price: string;
    image: string | null;
    status: string;
    stock: number;
    slug: string;
}

interface ProductsTableProps {
    products: Product[];
    onDelete?: (id: number) => void;
}

export default function ProductsTable({ products, onDelete }: ProductsTableProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-secondary/10 text-secondary';
        }
    };

    // ── MOBILE CARD VIEW ──
    const MobileCardView = () => (
        <div className="md:hidden space-y-3">
            {products.map((product) => (
                <div key={product.id} className="bg-background border border-border overflow-hidden">
                    <div className="flex gap-3 p-3">
                        {/* Product image */}
                        <div className="w-16 h-16 bg-secondary/10 relative overflow-hidden flex-shrink-0">
                            {product.image && (
                                <Image 
                                    src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-primary truncate leading-snug">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-bold">₦{parseFloat(product.price).toLocaleString()}</span>
                                <span className="text-[10px] text-secondary">· {product.stock} in stock</span>
                            </div>
                            <div className="mt-1.5">
                                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(product.status)}`}>
                                    {product.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex items-center border-t border-border/50 divide-x divide-border/50">
                        <Link 
                            href={`/products/${product.slug}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary hover:bg-secondary/5 transition-colors"
                        >
                            <ExternalLink className="w-3 h-3" />
                            View
                        </Link>
                        <Link 
                            href={`/dashboard/vendor/products/${product.id}/edit`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-secondary hover:text-primary hover:bg-secondary/5 transition-colors"
                        >
                            <Edit2 className="w-3 h-3" />
                            Edit
                        </Link>
                        <button 
                            onClick={() => onDelete?.(product.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </div>
            ))}
            {products.length === 0 && (
                <div className="bg-background border border-border px-6 py-12 text-center text-secondary text-sm">
                    No products found.
                </div>
            )}
        </div>
    );

    // ── DESKTOP TABLE VIEW ──
    const DesktopTableView = () => (
        <div className="hidden md:block bg-background border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-secondary uppercase tracking-widest border-b border-border bg-secondary/5">
                    <tr>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium text-right">Price</th>
                        <th className="px-6 py-4 font-medium text-right">Stock</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-secondary/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-secondary/10 relative overflow-hidden flex-shrink-0">
                                        {product.image && (
                                            <Image 
                                                src={product.image.startsWith('http') ? product.image : `${API_BASE_URL}${product.image}`}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-primary line-clamp-1">{product.name}</span>
                                        <Link href={`/products/${product.slug}`} className="text-[10px] text-secondary hover:text-primary flex items-center gap-1 transition-colors uppercase tracking-widest font-bold">
                                            View in Shop <ExternalLink className="w-2 h-2" />
                                        </Link>
                                    </div>
                                </div>
                            </td>
                             <td className="px-6 py-4 text-right">₦{parseFloat(product.price).toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">{product.stock}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(product.status)}`}>
                                    {product.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link 
                                        href={`/dashboard/vendor/products/${product.id}/edit`}
                                        className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-secondary" />
                                    </Link>
                                    <button 
                                        onClick={() => onDelete?.(product.id)}
                                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <>
            <MobileCardView />
            <DesktopTableView />
        </>
    );
}
