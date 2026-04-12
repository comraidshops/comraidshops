'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface HeaderVisibilityWrapperProps {
  children: ReactNode;
}

// Separate component for the top padding logic to be used on the <main> tag
export function GlobalHeaderPadding({ children }: HeaderVisibilityWrapperProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  return (
    <div className={isDashboard ? "" : "pt-16"}>
      {children}
    </div>
  );
}

export default function HeaderVisibilityWrapper({ children }: HeaderVisibilityWrapperProps) {
  const pathname = usePathname();
  
  // Hide global elements on all dashboard routes
  const isDashboard = pathname?.startsWith('/dashboard');
  
  if (isDashboard) {
    return null;
  }
  
  return <>{children}</>;
}
