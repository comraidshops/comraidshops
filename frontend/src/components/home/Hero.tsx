'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
            {/* Background Image / Video Placeholder */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-placeholder.jpg"
                    alt="Hero Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                {/* Fallback gradient if no image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-4xl mx-auto space-y-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-7xl font-bold tracking-tighter uppercase"
                >
                    Run With The Pack
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-xl text-gray-200 max-w-lg"
                >
                    Discover the new collection from our curated vendors.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <Link
                        href="/shop"
                        className="inline-block border border-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300"
                    >
                        Shop Now
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
