'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * AuthGuard - Protects private routes from unauthorized access.
 * Redirects to /auth/login if user is not authenticated.
 */
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--accent-cyan)'
      }}>
        <div className="spinner" />
        <span style={{ marginLeft: '12px' }}>Verifying Identity...</span>
      </div>
    );
  }

  // Allow access if user is authenticated OR if we're on an auth/public page
  if (user || pathname.startsWith('/auth') || pathname === '/') {
    return <>{children}</>;
  }

  return null;
}
