import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthHandler } from '@/components/auth/auth-handler';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'ZoZoKid',
  description: 'A safe reels experience for kids.',
  manifest: '/manifest.json',
  themeColor: '#000000',
  icons: {
    icon: [],
    shortcut: [],
    apple: [],
    other: [],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <FirebaseClientProvider>
          <AuthHandler />
          {children}
        </FirebaseClientProvider>
        <Toaster />
        <Script src="https://www.youtube.com/iframe_api" strategy="lazyOnload" />
      </body>
    </html>
  );
}
