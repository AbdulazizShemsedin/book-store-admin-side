import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { MswProvider } from '@/providers/msw-provider';
import { SidebarProvider } from '@/providers/sidebar-provider';

export const metadata: Metadata = {
  title: 'TEWBA Admin Portal - Bookstore Management',
  description: 'Administrative portal for managing books, authors, publishers, categories, promotional campaigns, and financial analytics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-[#f8fafc] text-slate-900">
        <MswProvider>
          <QueryProvider>
            <AuthProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </AuthProvider>
          </QueryProvider>
        </MswProvider>
      </body>
    </html>
  );
}
