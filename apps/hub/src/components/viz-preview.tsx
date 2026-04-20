'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export interface VizPreviewProps {
    code: string;
    title?: string;
    debounceMs?: number;
}

interface PreviewError {
    text: string;
    line?: number;
    column?: number;
}

export function VizPreview({ code, title, debounceMs = 400 }: VizPreviewProps) {
    const { resolvedTheme } = useTheme();
    const [srcDoc, setSrcDoc] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState<PreviewError[]>([]);
    const [loading, setLoading] = useState(false);
    const theme = resolvedTheme === 'light' ? 'light' : 'dark';

    useEffect(() => {
        const handle = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, title, theme }),
                });
                const data = await res.json();
                if (!data.ok) {
                    setErrors(
                        (data.errors ?? []).map((e: { text: string; location?: { line: number; column: number } }) => ({
                            text: e.text,
                            line: e.location?.line,
                            column: e.location?.column,
                        }))
                    );
                    return;
                }
                setErrors([]);
                setSrcDoc(data.html);
            } catch (err) {
                setErrors([{ text: String(err) }]);
            } finally {
                setLoading(false);
            }
        }, debounceMs);
        return () => clearTimeout(handle);
    }, [code, title, theme, debounceMs]);

    return (
        <div className="relative flex h-full w-full flex-col bg-muted/30">
            <iframe
                srcDoc={srcDoc}
                className="h-full w-full flex-1 border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
                title="viz preview"
            />
            {loading && (
                <div className="pointer-events-none absolute right-2 top-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
                    compiling…
                </div>
            )}
            {errors.length > 0 && (
                <div className="max-h-40 overflow-auto border-t border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
                    {errors.map((e, i) => (
                        <div key={i}>
                            {e.line != null ? `[${e.line}:${e.column ?? 0}] ` : ''}
                            {e.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
