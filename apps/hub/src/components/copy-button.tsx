'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CopyButtonProps {
    text: string;
    className?: string;
    label?: string;
}

export function CopyButton({ text, className, label = 'Copy' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const onClick = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // ignore
        }
    };

    return (
        <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onClick}
            aria-label={copied ? 'Copied' : label}
            className={cn(
                'bg-background/80 opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100',
                className,
            )}
        >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
    );
}
