import React from 'react';

import '@/global.css';
import '@/global.scss';

import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/hooks/use-store';
import { LocalStorageProvider } from '@/hooks/use-local-storage';
import { CookiesProvider } from 'next-client-cookies/server';

import { ViewTransitions } from 'next-view-transitions';

export const metadata = {
    title: 'Safe Chat',
    description: 'A secure messaging service.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <CookiesProvider>
                    <LocalStorageProvider>
                        <StoreProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <div className="w-full bg-background relative h-[100dvh]">
                                    <ViewTransitions>{children}</ViewTransitions>
                                </div>
                            </ThemeProvider>
                        </StoreProvider>
                    </LocalStorageProvider>
                </CookiesProvider>
            </body>
        </html>
    );
}
