import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastProvider from '@/components/ToastProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Veltro - Business Management Platform",
  description: "Manage bookings, leads, forms, and more with Veltro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <ErrorBoundary>
              {children}
              <ToastProvider />
            </ErrorBoundary>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
