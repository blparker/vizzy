'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = mounted && resolvedTheme === 'dark';
    const label = mounted
        ? isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        : 'Toggle theme';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={label}
            title={label}
            suppressHydrationWarning
        >
            {mounted ? (
                isDark ? (
                    <Sun className="size-4" />
                ) : (
                    <Moon className="size-4" />
                )
            ) : (
                <Sun className="size-4 opacity-0" />
            )}
        </Button>
    );
}
