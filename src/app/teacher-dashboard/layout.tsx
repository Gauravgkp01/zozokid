import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light flex min-h-screen w-full flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-foreground">ZoZoKid Teacher</h1>
        </div>
        <Button
          variant="outline"
          className="rounded-full border-gray-300 text-foreground"
          asChild
        >
          <Link href="/teacher/login">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
