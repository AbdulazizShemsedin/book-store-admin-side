import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { MswProvider } from '@/providers/msw-provider';
import { SidebarProvider } from '@/providers/sidebar-provider';
import { ThemeProvider } from '@/providers/theme-provider';

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-[#f8fafc] dark:bg-[#070a10] text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <MswProvider>
            <QueryProvider>
              <AuthProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </AuthProvider>
            </QueryProvider>
          </MswProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
