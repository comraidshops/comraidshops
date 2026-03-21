import React from 'react';

/**
 * Dummy page to satisfy legacy manifest requirements in experimental Next.js builds.
 * This file helps bypass the 'ENOENT: pages-manifest.json' error during production build.
 */
export default function DummyPage() {
    return <div>Build Stabilization Active</div>;
}
