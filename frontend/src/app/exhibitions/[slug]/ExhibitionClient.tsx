'use client';

import { Exhibition } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface ExhibitionClientProps {
    exhibition: Exhibition;
}

export default function ExhibitionClient({ exhibition }: ExhibitionClientProps) {
    const heroMedia = exhibition.cover_image || exhibition.thumbnail;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* HERO SECTION */}
            <header className="relative min-h-[85vh] md:min-h-0 md:aspect-[3/4] lg:aspect-[16/10] xl:aspect-[21/9] flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden">
                {/* Immersive Background */}
                {heroMedia && (
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={heroMedia}
                            alt={exhibition.title}
                            fill
                            unoptimized
                            className="object-cover opacity-30 object-center mix-blend-luminosity scale-105 duration-1000 ease-out animate-in fade-in zoom-in-95"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                    </div>
                )}

                <div className="relative z-10 max-w-5xl mx-auto text-center w-full mt-auto mb-16 space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-150">
                    <span className="inline-block text-xs font-medium uppercase tracking-[0.3em] text-primary/80 mb-4 px-4 py-1.5 border border-primary/20 rounded-full backdrop-blur-sm bg-background/5">
                        Curated Exhibition
                    </span>
                    
                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-semibold uppercase tracking-tighter leading-[0.85] text-balance">
                        {exhibition.title}
                    </h1>
                    
                    {exhibition.description && (
                        <p className="text-lg md:text-2xl font-light leading-relaxed max-w-3xl mx-auto text-secondary/90 text-balance animate-in fade-in duration-1000 delay-300">
                            {exhibition.description}
                        </p>
                    )}
                </div>
            </header>

            <main className="max-w-[1920px] mx-auto pb-32">
                
                {/* CURATOR'S NOTE & THUMBNAIL */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 px-6 md:px-12 py-24 items-center">
                    <div className="lg:col-span-5 relative aspect-[3/4] group overflow-hidden bg-secondary/5 rounded-sm">
                        {exhibition.thumbnail ? (
                            <Image
                                src={exhibition.thumbnail}
                                alt="Exhibition Key Visual"
                                fill
                                unoptimized
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                            />
                        ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs uppercase tracking-widest text-secondary/20">Archival</span>
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    </div>
                    
                    <div className="lg:col-span-6 lg:col-start-7 space-y-8">
                        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.2em] text-primary/60">
                            <span className="w-12 h-px bg-primary/20"></span>
                            <span>The Curator&apos;s Room</span>
                        </div>
                        
                        <div className="prose prose-lg dark:prose-invert prose-p:font-light prose-p:leading-loose text-secondary/90">
                            {exhibition.curator_note ? (
                                <p className="text-xl md:text-2xl leading-relaxed font-serif italic text-balance">
                                    &quot;{exhibition.curator_note}&quot;
                                </p>
                            ) : (
                                <p className="text-xl md:text-2xl leading-relaxed font-serif italic text-balance">
                                    &quot;Observe the silence between the pieces. The void gives shape to the form.&quot;
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* THE COLLECTION: FEATURED PIECES (PRODUCTS) */}
                {exhibition.products && exhibition.products.length > 0 && (
                    <section className="py-24 border-t border-secondary/10 bg-secondary/[0.02]">
                        <div className="px-6 md:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-2">The Collection</h2>
                                <p className="text-secondary/60 text-sm uppercase tracking-widest">Available Pieces</p>
                            </div>
                            <span className="text-xs font-mono text-secondary/40">{exhibition.products.length} ARTIFACTS</span>
                        </div>
                        
                        <div className="px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {exhibition.products.map(product => (
                                <Link href={`/products/${product.slug}`} key={product.id} className="group cursor-pointer">
                                    <div className="relative aspect-[4/5] bg-secondary/5 mb-6 overflow-hidden rounded-sm">
                                        {product.image ? (
                                            <Image 
                                                src={product.image} 
                                                alt={product.name} 
                                                fill 
                                                unoptimized
                                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
                                                <span className="text-xs uppercase tracking-widest text-secondary/30">Missing Media</span>
                                            </div>
                                        )}
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="space-y-2 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                            <p className="text-sm text-secondary/60 font-mono">₦{Number(product.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* EDITORALS (ARTICLES) */}
                {exhibition.articles && exhibition.articles.length > 0 && (
                    <section className="py-24 px-6 md:px-12 border-t border-secondary/10">
                        <div className="mb-16">
                            <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-2">Editorial Context</h2>
                            <p className="text-secondary/60 text-sm uppercase tracking-widest">Archived Literature</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                            {exhibition.articles.map((article, idx) => (
                                <Link href={`/magazine/${article.slug}`} key={article.id} className="group block">
                                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-secondary/5 mb-8">
                                         {article.cover ? (
                                            <Image 
                                                src={article.cover} 
                                                alt={article.title} 
                                                fill 
                                                unoptimized
                                                className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" 
                                            />
                                         ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs uppercase tracking-widest text-secondary/20">Text Only</span>
                                            </div>
                                         )}
                                    </div>
                                    <div className="flex gap-6 items-baseline">
                                        <span className="text-xl font-light text-secondary/30">{(idx + 1).toString().padStart(2, '0')}</span>
                                        <h3 className="text-2xl md:text-3xl font-serif italic text-secondary/90 group-hover:text-primary transition-colors duration-300">
                                            {article.title}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* COLLECTIONS / MAGAZINES MINIMAL FOOTER REFS */}
                {((exhibition.collections && exhibition.collections.length > 0) || (exhibition.magazines && exhibition.magazines.length > 0)) && (
                    <section className="py-24 px-6 md:px-12 border-t border-secondary/10 bg-secondary/[0.02]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {exhibition.collections && exhibition.collections.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-primary/60 mb-6">Associated Collections</h4>
                                    <ul className="space-y-4">
                                        {exhibition.collections.map(col => (
                                            <li key={col.id}>
                                                <Link href={`/collections/${col.slug}`} className="text-lg md:text-xl font-light hover:text-primary hover:translate-x-2 inline-block transition-all duration-300">
                                                    {col.name} <span className="text-secondary/30 ml-2">→</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {exhibition.magazines && exhibition.magazines.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-medium uppercase tracking-[0.2em] text-primary/60 mb-6">Featured In Issues</h4>
                                    <ul className="space-y-4">
                                        {exhibition.magazines.map(mag => (
                                            <li key={mag.id}>
                                                <Link href={`/magazine/${mag.slug}`} className="text-lg md:text-xl font-light hover:text-primary hover:translate-x-2 inline-block transition-all duration-300">
                                                    {mag.title} <span className="text-secondary/30 ml-2">→</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
