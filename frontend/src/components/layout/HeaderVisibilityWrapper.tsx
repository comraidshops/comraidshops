'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface HeaderVisibilityWrapperProps {
  children: ReactNode;
}

// Separate component for the top padding logic to be used on the <main> tag
export function GlobalHeaderPadding({ children }: HeaderVisibilityWrapperProps) {
  const pathname = usePathname();
  // Only remove padding on User and Vendor dashboards where the global header is hidden
  const isClippedDashboard = pathname?.startsWith('/dashboard/user') || pathname?.startsWith('/dashboard/vendor');
  
  return (
    <div className={isClippedDashboard ? "" : "pt-16"}>
      {children}
    </div>
  );
}

export default function HeaderVisibilityWrapper({ children }: HeaderVisibilityWrapperProps) {
  const pathname = usePathname();
  
  // Hide global elements on User and Vendor dashboards to maintain the "Terminal" feel,
  // but keep them on the Admin dashboard where superusers need full site access.
  const hideGlobal = pathname?.startsWith('/dashboard/user') || pathname?.startsWith('/dashboard/vendor');
  
  if (hideGlobal) {
    return null;
  }
  
  return <>{children}</>;
}
