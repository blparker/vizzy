import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'vizzy hub',
    description: 'Create, save, and embed vizzy visualizations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider afterSignOutUrl="/">
            <html lang="en" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
                <body>
                    <ThemeProvider>{children}</ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
