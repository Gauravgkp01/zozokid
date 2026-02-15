import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex items-center justify-center gap-4">
        <Icons.logo className="h-16 w-16 text-primary" />
        <div className="flex flex-col">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        </div>
      </div>
      <p className="mt-4 text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button asChild className="mt-6">
        <Link href="/feed">Go to Feed</Link>
      </Button>
    </div>
  );
}
