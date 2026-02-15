import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-black">
      <header className="absolute top-0 z-10 flex h-14 items-center p-4">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <Link href="/profiles">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Profiles</span>
          </Link>
        </Button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
