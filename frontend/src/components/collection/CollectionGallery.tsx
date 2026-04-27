"use client"
import { motion, Variants } from "framer-motion"
import { CollectionImage } from "@/lib/types"
import Image from "next/image"
import { MEDIA_BASE } from "@/lib/constants"

interface CollectionGalleryProps {
    images?: CollectionImage[];
}

export default function CollectionGallery({ images }: CollectionGalleryProps) {
    if (!images || images.length === 0) return null;

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.21, 0.47, 0.32, 0.98]
            }
        }
    };

    return (
        <section className="py-20 md:py-32 px-6 md:px-10 lg:px-16 bg-background">
            <motion.div 
                className="max-w-[1600px] mx-auto space-y-24 md:space-y-40"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                {images.map((image, index) => (
                    <motion.div 
                        key={image.id || index}
                        variants={item}
                        className="relative w-full group"
                    >
                        <div className="relative aspect-auto min-h-[400px] md:min-h-[700px] overflow-hidden bg-accent/5">
                            <Image
                                src={image.image.startsWith('http') ? image.image : `${MEDIA_BASE}${image.image}`}
                                alt={image.caption || `Gallery image ${index + 1}`}
                                width={1920}
                                height={1080}
                                className="w-full h-auto object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.02]"
                                loading="lazy"
                                sizes="100vw"
                            />
                        </div>
                        
                        {image.caption && (
                            <div className="mt-6 md:mt-8 flex justify-end">
                                <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-secondary/50 font-light max-w-md text-right">
                                    {image.caption}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
