'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Magazine } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export default function ArticlesClient({ initialArticles }: { initialArticles: Magazine[] }) {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">
            <header className="max-w-[1920px] mx-auto mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">EDITORIALS</span>
                    <h1 className="font-playfair text-6xl md:text-8xl font-medium tracking-tight">
                        Selected <span className="italic opacity-60 text-5xl md:text-7xl">Articles.</span>
                    </h1>
                    <p className="text-secondary max-w-xl text-sm md:text-base leading-relaxed mt-4">
                        Deep dives into craft, discipline, and the architectural evolution of independent brands. 
                        A curated archive of the ComraidShops philosophy.
                    </p>
                </motion.div>
            </header>

            <main className="max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                    {initialArticles.map((article, idx) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative"
                        >
                            <Link href={`/magazine/${article.slug}`}>
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-all duration-700 group-hover:border-white/30">
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 backdrop-blur-[0px] group-hover:backdrop-blur-sm transition-all duration-700 z-10" />
                                    
                                    <Image
                                        src={article.thumbnail || "/placeholder-article.jpg"}
                                        alt={article.title}
                                        fill
                                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                    />

                                    {/* Bottom Content (Inside Glass) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Volume 01</span>
                                                <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">
                                                    {article.created_at ? new Date(article.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '2026'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2 leading-tight">
                                                {article.title}
                                            </h3>
                                            <div 
                                                className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-4"
                                                dangerouslySetInnerHTML={{ __html: article.excerpt || '' }}
                                            />
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">
                                                Read Fully <ArrowRight size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
