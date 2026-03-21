"use client"
import { motion } from "framer-motion"
import { EditorialRef } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { API_BASE_URL } from "@/lib/api"

export default function EditorialSection({ refs, type }: { refs?: EditorialRef[], type: 'Editorial' | 'Exhibition' }) {
    if (!refs || refs.length === 0) return null;

    const basePath = type === 'Editorial' ? '/magazine' : '/exhibitions';

    return (
        <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
            <div className="max-w-[1400px] mx-auto text-center md:text-left">
                <div className="mb-20">
                    <h2 className="text-xs uppercase tracking-[0.3em] text-secondary">
                        {type === 'Editorial' ? 'In Print & Media' : 'Exhibitions'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                    {refs.map((item, idx) => (
                        <Link href={`${basePath}/${item.slug}`} key={item.id} className="group block">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: (idx % 3) * 0.15, duration: 0.8 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/5">
                                    {item.thumbnail ? (
                                        <Image
                                            src={item.thumbnail.startsWith('http') ? item.thumbnail : `${API_BASE_URL}${item.thumbnail}`}
                                            alt={item.title}
                                            fill
                                            unoptimized={true}
                                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-secondary/50">
                                            <span className="text-sm tracking-widest uppercase">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left">
                                    <h3 className="text-xl md:text-2xl font-light tracking-wide group-hover:opacity-70 transition-opacity">
                                        {item.title}
                                    </h3>
                                    <span className="text-xs uppercase tracking-widest text-secondary mt-3 block">
                                        Explore {type}
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
