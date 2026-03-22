'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Image as ImageIcon, Plus as PlusIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { API_BASE_URL } from '@/lib/constants';
import 'react-quill-new/dist/quill.snow.css';


const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    loading?: boolean;
}

export function AdminModal({ isOpen, onClose, title, children, loading }: ModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100]"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 lg:p-12 z-[101] max-h-[90vh] overflow-y-auto no-scrollbar"
                    >
                        <header className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-playfair font-medium tracking-tight">{title}</h2>
                            <button 
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </header>

                        <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                            {children}
                        </div>

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-[40px]">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function AdminInput({ label, ...props }: InputProps) {
    return (
        <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <input 
                {...props}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
            />
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string | number; label: string }[];
}

export function AdminSelect({ label, options, ...props }: SelectProps) {
    return (
        <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <select 
                {...props}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all text-white appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0a0a0a] text-white py-2">{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export function AdminTextArea({ label, ...props }: TextAreaProps) {
    return (
        <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <textarea 
                {...props}
                rows={4}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10 resize-none"
            />
        </div>
    );
}


export function AdminImageUpload({ 
    label, 
    value, 
    onChange, 
    preview 
}: { 
    label: string; 
    value?: string; 
    onChange: (file: File) => void;
    preview?: string | File | null;
}) {
    const inputId = `image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
            setLocalPreview(URL.createObjectURL(file));
        }
        // Reset input so selecting the same file triggers change again
        e.target.value = '';
    };

    let displayPreview: string | undefined = undefined;
    if (localPreview) {
        displayPreview = localPreview;
    } else if (preview) {
        if (typeof preview === 'string') {
            displayPreview = preview;
        } else if (preview instanceof File && typeof window !== 'undefined') {
            displayPreview = URL.createObjectURL(preview);
        }
    } else if (value) {
        displayPreview = value;
    }

    const currentPreview = displayPreview;

    return (
        <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <div className="relative group/upload">
                <input 
                    type="file" 
                    id={inputId}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label 
                    htmlFor={inputId}
                    className={`
                        relative block w-full aspect-video rounded-2xl overflow-hidden cursor-pointer
                        border border-dashed border-white/10 hover:border-primary/50 transition-all
                        ${currentPreview ? '' : 'bg-white/[0.03]'}
                    `}
                >
                    {currentPreview ? (
                        <>
                            <Image 
                                src={currentPreview.startsWith('http') || currentPreview.startsWith('blob:') || currentPreview.startsWith('/') ? currentPreview : `${API_BASE_URL}${currentPreview}`}
                                alt="Preview"
                                fill
                                className="object-contain"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <PlusIcon className="w-8 h-8 text-primary" />
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20 group-hover/upload:text-primary transition-colors">
                            <ImageIcon className="w-10 h-10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Select Image Layout</span>
                        </div>
                    )}
                </label>
            </div>
            

        </div>
    );
}


export function AdminRichText({ label, value, onChange }: { label: string; value: string; onChange: (content: string) => void }) {
    return (
        <div className="space-y-2 mb-6 admin-rich-text">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                <ReactQuill 
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    style={{ background: 'transparent', color: 'white' }}
                />
            </div>
            <style jsx global>{`
                .admin-rich-text .ql-toolbar {
                    border: none !important;
                    background: rgba(255, 255, 255, 0.02) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .admin-rich-text .ql-container {
                    border: none !important;
                    font-family: inherit !important;
                    font-size: 11px !important;
                }
                .admin-rich-text .ql-editor {
                    min-height: 200px;
                    color: white !important;
                    font-size: 14px !important;
                    line-height: 1.6 !important;
                }
                .admin-rich-text .ql-snow .ql-stroke {
                    stroke: rgba(255, 255, 255, 0.4) !important;
                }
                .admin-rich-text .ql-snow .ql-fill {
                    fill: rgba(255, 255, 255, 0.4) !important;
                }
                .admin-rich-text .ql-snow .ql-picker {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
            `}</style>
        </div>
    );
}

export function AdminMultiSelect({ 
    label, 
    options, 
    value = [], // default to empty array
    onChange 
}: { 
    label: string, 
    options: { value: number | string, label: string }[], 
    value?: (number | string)[], 
    onChange: (values: (number | string)[]) => void 
}) {
    const handleToggle = (optValue: number | string) => {
        if (value.includes(optValue)) {
            onChange(value.filter(v => v !== optValue));
        } else {
            onChange([...value, optValue]);
        }
    };

    return (
        <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">{label}</label>
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 max-h-48 overflow-y-auto no-scrollbar space-y-2">
                {options.length === 0 ? (
                    <p className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">No options available</p>
                ) : (
                    options.map((opt) => {
                        const isSelected = value.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleToggle(opt.value)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                                    isSelected 
                                    ? 'bg-primary/10 text-primary border border-primary/20' 
                                    : 'bg-black/20 text-white/60 hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <span className="text-[11px] font-bold tracking-widest uppercase truncate">{opt.label}</span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'border-primary bg-primary' : 'border-white/20'
                                }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
