"use client"
import { motion } from "framer-motion"
import { BrandImage } from "@/lib/types"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/api"

export default function MediaGallery({ gallery }: { gallery?: BrandImage[] }) {
    if (!gallery || gallery.length === 0) return null;

    return (
        <section className="py-16 md:py-24 overflow-hidden">
            <div className="px-6 md:px-10 lg:px-16 mb-20 md:mb-32 max-w-[1400px] mx-auto text-center md:text-left">
                <h2 className="text-xs uppercase tracking-[0.3em] text-secondary">
                    Archives
                </h2>
            </div>

            {/* Horizontal scrolling marquee style for gallery, much more spaced out */}
            <div className="flex gap-8 md:gap-16 px-6 md:px-10 lg:px-32 overflow-x-auto pb-16 snap-x snap-mandatory scrollbar-hide">
                {gallery.map((img, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative flex-none w-[85vw] md:w-[60vw] lg:w-[45vw] aspect-[4/5] md:aspect-[16/10] snap-center group overflow-hidden"
                    >
                        <Image
                            src={img.image.startsWith('http') ? img.image : `${API_BASE_URL}${img.image}`}
                            alt={img.caption || "Brand Media"}
                            fill
                            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.03]"
                        />
                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <p className="text-sm md:text-base tracking-[0.15em] uppercase text-white font-light">{img.caption}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
