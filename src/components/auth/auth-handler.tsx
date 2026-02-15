'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AUTH_ROUTES = ['/login', '/signup'];
const PRIVATE_ROUTES = ['/feed', '/profiles', '/parent-dashboard'];

export function AuthHandler() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return;

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    // Exact match for private routes
    const isPrivateRoute = PRIVATE_ROUTES.includes(pathname);

    if (!user && isPrivateRoute) {
      router.push('/login');
    }
    if (user && isAuthRoute) {
      router.push('/profiles');
    }
  }, [user, isUserLoading, pathname, router]);

  return null; // This component doesn't render anything
}
