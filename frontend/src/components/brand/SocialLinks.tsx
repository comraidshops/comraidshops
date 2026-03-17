"use client"
import { motion } from "framer-motion"

interface SocialLinksProps {
    website?: string;
    socials?: Record<string, string>;
}

export default function SocialLinks({ website, socials }: SocialLinksProps) {
    if (!website && (!socials || Object.keys(socials).length === 0)) return null;

    const entries = Object.entries(socials || {});

    return (
        <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 text-center bg-foreground text-background">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-4xl mx-auto flex flex-col items-center gap-12"
            >
                <div className="w-px h-24 bg-background/20" />

                <h2 className="text-xs uppercase tracking-[0.4em] text-background/60">Directory</h2>

                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-8">
                    {website && (
                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base uppercase tracking-[0.2em] hover:text-background/60 transition-colors underline underline-offset-[12px] decoration-background/20 hover:decoration-background/60 duration-300">
                            Official Site
                        </a>
                    )}

                    {entries.map(([platform, url]) => (
                        <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm md:text-base uppercase tracking-[0.2em] hover:text-background/60 transition-colors underline underline-offset-[12px] decoration-background/20 hover:decoration-background/60 duration-300"
                        >
                            {platform}
                        </a>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
