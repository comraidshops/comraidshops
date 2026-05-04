'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { investorGoogleLogin } from '@/lib/fetchers';
import { API_BASE_URL } from '@/lib/constants';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const code = searchParams?.get('code');
        if (code) {
            handleGoogleCallback(code);
        } else {
            router.push('/investor-login?error=No code provided');
        }
    }, [searchParams, router]);

    const handleGoogleCallback = async (code: string) => {
        try {
            // Call the INVESTOR specific google login endpoint
            const res = await investorGoogleLogin({ 
                code,
                callback_url: `${window.location.origin}/investor/auth/callback`
            });

            localStorage.setItem('access_token', res.access);
            localStorage.setItem('refresh_token', res.refresh);
            localStorage.setItem('user_role', 'investor');
            
            router.push('/investor/dashboard');
        } catch (error) {
            console.error('Investor Google Login Error:', error);
            const message = error instanceof Error ? error.message : 'Google authentication failed';
            router.push(`/investor-login?error=${encodeURIComponent(message)}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin mb-8"></div>
            <div className="space-y-2 text-center">
                <h1 className="text-white font-bold uppercase tracking-widest text-sm">Authenticating Shareholder</h1>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">Establishing secure node connection...</p>
            </div>
        </div>
    );
}

export default function InvestorAuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    );
}
