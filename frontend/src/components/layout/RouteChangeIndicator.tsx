'use client';

import { AppProgressBar as NProgress } from 'next-nprogress-bar';

/**
 * RouteChangeIndicator
 *
 * Uses `next-nprogress-bar` which hooks directly into the Next.js App Router
 * lifecycle — NOT click events. This means:
 *   - No false positives (clicking non-navigating links won't show the bar)
 *   - No hanging bars (cancelled or same-page navigations are ignored)
 *   - No 8-second timeouts needed
 *
 * The bar only appears when Next.js is actually fetching/rendering a new route.
 */
export default function RouteChangeIndicator() {
    return (
        <NProgress
            height="2px"
            color="#ffffff"
            options={{
                showSpinner: false,
                trickleSpeed: 200,
                minimum: 0.15,
                easing: 'ease',
                speed: 300,
            }}
            shallowRouting
        />
    );
}
