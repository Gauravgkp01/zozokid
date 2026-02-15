import { Icons } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-secondary p-4">
      <div className="mb-8 flex items-center gap-3 text-3xl font-bold text-foreground">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="font-headline">ZoZoKid</h1>
      </div>
      {children}
    </div>
  );
}
