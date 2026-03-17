"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

interface HeroSectionProps {
    name: string;
    description?: string;
    heroImage?: string | null;
}

export default function HeroSection({ name, description, heroImage }: HeroSectionProps) {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 800], [0, 200])
    const opacity = useTransform(scrollY, [0, 400], [1, 0])

    return (
        <section className="relative w-full h-[85vh] md:h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-background">
            {heroImage && typeof heroImage === 'string' && heroImage.length > 0 ? (
                <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 h-full w-full">
                    <Image
                        src={heroImage}
                        alt={name}
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="100vw"
                    />
                    {/* Subtle dark gradient overlay to improve text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/30 z-10" />
                </motion.div>
            ) : (
                <div className="absolute inset-0 z-0 bg-secondary/5" />
            )}

            <motion.div
                style={{ opacity, y: useTransform(scrollY, [0, 400], [0, 80]) }}
                className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center mt-20"
            >
                <h1 className="text-[clamp(3rem,8vw,8rem)] font-light uppercase tracking-widest mb-10 leading-none">
                    {name}
                </h1>
                {description && (
                    <p className="text-lg md:text-xl text-foreground/80 max-w-3xl leading-relaxed tracking-wide font-light">
                        {description}
                    </p>
                )}
            </motion.div>
        </section>
    )
}
