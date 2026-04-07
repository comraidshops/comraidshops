'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { motion } from 'framer-motion';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Verifying with Google...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams?.get('code');
            
            if (!code) {
                setError('No authorization code found from Google.');
                return;
            }

            try {
                setStatus('Exchanging credentials...');
                
                const res = await fetch(`${API_BASE_URL}/auth/google/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        code,
                        callback_url: `${window.location.origin}/auth/callback`
                    }),
                });

                // Handle non-JSON responses (e.g. 500 HTML error pages)
                const contentType = res.headers.get('content-type') || '';
                let data;
                if (contentType.includes('application/json')) {
                    data = await res.json();
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response:", res.status, text);
                    data = { error: `Server error (${res.status}). Please try again later.` };
                }

                if (res.ok) {
                    setStatus('Success! Archiving session...');
                    localStorage.setItem('access_token', data.access_token || data.access);
                    localStorage.setItem('refresh_token', data.refresh_token || data.refresh);
                    
                    // Small delay for visual feedback
                    setTimeout(() => {
                        router.push('/dashboard/user');
                    }, 1000);
                } else {
                    console.error("Auth failed:", data);
                    setError(data.detail || data.error || 'Authentication with Google failed.');
                }
            } catch (err) {
                console.error("Callback error:", err);
                setError('A network error occurred during Google authentication.');
            }
        };

        handleCallback();
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="space-y-6">
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest text-center">
                    {error}
                </div>
                <button 
                    onClick={() => router.push('/auth/login')}
                    className="w-full bg-primary text-background py-4 text-[10px] font-bold uppercase tracking-widest"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-center">
            <div className="flex justify-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary animate-pulse">
                {status}
            </p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <CallbackHandler />
                </Suspense>
            </motion.div>
        </div>
    );
}
