'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PARENT_AUTH_ROUTES = ['/login', '/signup'];
const TEACHER_AUTH_ROUTES = ['/teacher/login'];
const AUTH_ROUTES = [...PARENT_AUTH_ROUTES, ...TEACHER_AUTH_ROUTES];

const PARENT_PRIVATE_ROUTES = ['/feed', '/profiles', '/parent-dashboard'];
const TEACHER_PRIVATE_ROUTES = ['/teacher-dashboard'];
const PRIVATE_ROUTES = [...PARENT_PRIVATE_ROUTES, ...TEACHER_PRIVATE_ROUTES];


export function AuthHandler() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return;

    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isPrivateRoute = PRIVATE_ROUTES.some(route => pathname.startsWith(route));
    
    // Redirect away from private routes if not logged in
    if (!user && isPrivateRoute) {
      router.push('/login');
      return;
    }

    // Redirect away from auth routes if logged in
    if (user && isAuthRoute) {
      // This is a simplification. A real app would need roles to distinguish
      // between a parent and a teacher and redirect accordingly.
      // For now, if on a teacher auth page, go to teacher dashboard.
      if (TEACHER_AUTH_ROUTES.includes(pathname)) {
        router.push('/teacher-dashboard');
      } else {
        router.push('/profiles');
      }
      return;
    }
  }, [user, isUserLoading, pathname, router]);

  return null; // This component doesn't render anything
}
