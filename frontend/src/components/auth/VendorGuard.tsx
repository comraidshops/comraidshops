'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/vendor/login');
                return;
            }

            try {
                // Call vendor dashboard API to verify session and role
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendor/dashboard/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    setIsAuthorized(true);
                } else {
                    // 401 Unauthorized or 403 Forbidden
                    router.push('/vendor/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/vendor/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-secondary animate-pulse uppercase tracking-widest text-xs font-bold">
                    Verifying Access...
                </div>
            </div>
        );
    }

    return isAuthorized ? <>{children}</> : null;
}
