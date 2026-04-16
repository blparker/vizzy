'use client';

import { useEffect, useRef, useState } from 'react';

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
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [errors, setErrors] = useState<PreviewError[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handle = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, title }),
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
                if (iframeRef.current) {
                    iframeRef.current.srcdoc = data.html;
                }
            } catch (err) {
                setErrors([{ text: String(err) }]);
            } finally {
                setLoading(false);
            }
        }, debounceMs);
        return () => clearTimeout(handle);
    }, [code, title, debounceMs]);

    return (
        <div className="relative flex h-full w-full flex-col">
            <iframe
                ref={iframeRef}
                className="h-full w-full flex-1 border-0 bg-[#0b0b0e]"
                sandbox="allow-scripts"
                title="viz preview"
            />
            {loading && (
                <div className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-neutral-400">
                    compiling…
                </div>
            )}
            {errors.length > 0 && (
                <div className="max-h-40 overflow-auto border-t border-red-900/50 bg-red-950/40 p-3 font-mono text-xs text-red-300">
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
