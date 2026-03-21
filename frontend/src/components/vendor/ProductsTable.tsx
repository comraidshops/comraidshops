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
    return (
        <div className="bg-background border border-border overflow-x-auto">
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
                                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                    product.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    product.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-secondary/10 text-secondary'
                                }`}>
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
}
