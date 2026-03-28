"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/api"

interface FounderSectionProps {
    name?: string;
    bio?: string;
    story?: string;
    image?: string | null;
    establishedYear?: number | null;
    originCountry?: string;
}

export default function FounderSection({ name, bio, story, image, establishedYear, originCountry }: FounderSectionProps) {
    if (!name && !bio && !establishedYear && !story) return null;

    return (
        <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 bg-secondary/5">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center md:items-start gap-16 md:gap-24">

                {image && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="w-full md:w-1/2 aspect-[3/4] md:aspect-[4/5] relative overflow-hidden group shadow-2xl"
                    >
                        <Image
                            src={image.startsWith('http') ? image : `${API_BASE_URL}${image}`}
                            alt={name || "Founder"}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-[1.02] hover:scale-100"
                        />
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className={`w-full ${image ? 'md:w-1/2 md:pt-[5%]' : 'max-w-3xl mx-auto'} flex flex-col`}
                >
                    <h2 className="text-xs uppercase tracking-[0.3em] text-secondary mb-8 font-semibold">The Architect</h2>
                    {name && <h3 className="text-[clamp(2rem,4vw,3.5rem)] font-light tracking-wide mb-10 leading-tight break-words max-w-full">{name}</h3>}


                    <div className="flex flex-wrap gap-x-12 gap-y-4 mb-12 text-[10px] uppercase tracking-[0.4em] text-secondary">
                        {establishedYear && <div>Legacy Est. {establishedYear}</div>}
                        {originCountry && <div>Maison {originCountry}</div>}
                    </div>

                    <div className="space-y-12">
                        {bio && (
                            <div className="space-y-6 text-[18px] md:text-[20px] leading-relaxed text-foreground/80 font-light break-words [overflow-wrap:anywhere]">
                                {bio.replace(/[\u00A0]/g, ' ').replace(/&nbsp;/g, ' ').split('\n\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        )}



                        {story && (
                            <div className="pt-12 border-t border-foreground/5">
                                <h4 className="text-[10px] uppercase tracking-[0.4em] text-secondary mb-8 font-semibold">The Brand Story</h4>
                                <div className="space-y-6 text-[18px] md:text-[20px] leading-relaxed text-foreground/70 font-light italic break-words [overflow-wrap:anywhere]">
                                    {story.replace(/[\u00A0]/g, ' ').replace(/&nbsp;/g, ' ').split('\n\n').map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}
                                </div>


                            </div>
                        )}

                    </div>
                </motion.div>
            </div>
        </section>
    )
}
