"use client"
import { motion } from "framer-motion"
import { Collection } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { API_BASE_URL } from "@/lib/api"

export default function CollectionsSection({ collections }: { collections?: Collection[] }) {
    if (!collections || collections.length === 0) return null;

    return (
        <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-24 md:mb-32 text-center md:text-left">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-secondary">
                        Seasons & Collections
                    </h2>
                </div>

                <div className="flex gap-4 md:gap-8 px-6 md:px-10 lg:px-32 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide">
                    {collections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-shrink-0 w-80 md:w-96 snap-start group"
                        >
                            <Link href={`/collections/${collection.slug}`} className="block w-full h-full">
                                <div className="aspect-[4/5] relative overflow-hidden mb-6 bg-secondary/5">
                                    {collection.hero_image ? (
                                        <Image
                                            src={collection.hero_image.startsWith('http') ? collection.hero_image : `${API_BASE_URL}${collection.hero_image}`}
                                            alt={collection.name}
                                            fill
                                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-secondary tracking-widest uppercase text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {collection.season && (
                                        <span className="text-[10px] tracking-[0.4em] uppercase text-secondary group-hover:text-foreground transition-colors">
                                            {collection.season}
                                        </span>
                                    )}
                                    <h3 className="text-xl md:text-2xl font-light uppercase tracking-wide group-hover:opacity-70 transition-opacity">
                                        {collection.name}
                                    </h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
