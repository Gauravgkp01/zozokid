'use client';

import Link from 'next/link';
import { LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
  };

  return (
    <div className="light flex min-h-screen w-full flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">ZoZoKid Teacher</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell userType="teacher" />
          <Button
            asChild
            variant="outline"
            className="rounded-full border-gray-300 text-foreground"
          >
            <Link href="/parent-dashboard">
              <Users className="mr-2 h-4 w-4" />
              Parent View
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-gray-300 text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

    