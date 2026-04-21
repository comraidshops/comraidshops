"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/api"
import JoinCommunityButton from "./JoinCommunityButton"

interface HeroSectionProps {
    name: string;
    description?: string;
    heroImage?: string | null;
    brandSlug: string;
    isMember: boolean;
    communityCount: number;
}

export default function HeroSection({ name, description, heroImage, brandSlug, isMember, communityCount }: HeroSectionProps) {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 800], [0, 200])
    const opacity = useTransform(scrollY, [0, 400], [1, 0])

    return (
        <section className="relative w-full h-[85vh] md:h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-background">
            {heroImage && typeof heroImage === 'string' && heroImage.length > 0 ? (
                <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 h-full w-full xl:p-10">
                    <Image
                        src={heroImage.startsWith('http') ? heroImage : `${API_BASE_URL}${heroImage}`}
                        alt={name}
                        fill
                        className="object-cover xl:object-contain"
                        priority
                        sizes="100vw"
                    />
                    {/* Strengthened dark overlay to improve text readability on bright images */}
                    <div className="absolute inset-0 bg-black/20 bg-gradient-to-t from-background via-transparent to-black/40 z-10" />
                </motion.div>
            ) : (
                <div className="absolute inset-0 z-0 bg-secondary/5" />
            )}

            <motion.div
                style={{ opacity, y: useTransform(scrollY, [0, 400], [0, 80]) }}
                className="relative z-20 max-w-7xl mx-auto px-6 text-center flex flex-col items-center mt-20"
            >
                <h1 className="text-[clamp(2.5rem,10vw,8rem)] font-bold uppercase tracking-widest mb-10 leading-none drop-shadow-2xl break-words w-full max-w-full overflow-hidden">
                    {name}
                </h1>

                {description && (
                    <p className="text-sm md:text-xl text-foreground max-w-3xl leading-relaxed tracking-wide font-medium drop-shadow-lg break-words [overflow-wrap:anywhere]">
                        {description.replace(/[\u00A0]/g, ' ').replace(/&nbsp;/g, ' ')}
                    </p>
                )}




                <div className="mt-12">
                    <JoinCommunityButton 
                        brandSlug={brandSlug} 
                        isInitialMember={isMember} 
                        communityCount={communityCount} 
                    />
                </div>
            </motion.div>
        </section>
    )
}
