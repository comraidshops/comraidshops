'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface GoogleLoginButtonProps {
    text?: string;
}

export default function GoogleLoginButton({ text = "Continue with Google" }: GoogleLoginButtonProps) {
    const handleGoogleLogin = () => {
        const clientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const redirectURI = `${window.location.origin}/auth/callback`;
        const scope = "profile email";
        const responseType = "code";
        
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
        
        window.location.href = googleAuthUrl;
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-background border border-border py-4 px-6 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:border-primary transition-all group"
        >
            <div className="relative w-5 h-5 grayscale group-hover:grayscale-0 transition-all">
                <Image 
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                    alt="Google" 
                    fill 
                    className="object-contain"
                />
            </div>
            <span>{text}</span>
        </motion.button>
    );
}
