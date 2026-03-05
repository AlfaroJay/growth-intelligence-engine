import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AlphaCreative Growth Score',
  description:
    'Get your free Digital Growth Score and discover the highest-impact opportunities to grow your business online.',
  openGraph: {
    title: 'AlphaCreative Growth Score',
    description:
      'Get your free Digital Growth Score and discover the highest-impact opportunities to grow your business online.',
    url: 'https://thealphacreative.com',
    siteName: 'AlphaCreative',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
