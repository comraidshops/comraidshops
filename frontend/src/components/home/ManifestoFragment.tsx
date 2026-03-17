'use client';

import Image from 'next/image';

export default function ManifestoFragment() {
    return (
        <section className="py-48 px-6 bg-background flex items-center justify-center text-center relative overflow-hidden">
            {/* Atmosphere Background */}
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <Image
                    src="/new_image/IMG_4331.jpg" // Mapped Texture
                    alt="Texture"
                    fill
                    className="object-contain"
                />
            </div>

            <div className="max-w-3xl relative z-10">
                <p className="text-2xl md:text-4xl font-bold uppercase tracking-tighter leading-tight">
                    We do not chase trends. We hunt for conviction. <br />
                    <span className="text-secondary">ComraidShops exists for the runners who create.</span>
                </p>
            </div>
        </section>
    );
}
