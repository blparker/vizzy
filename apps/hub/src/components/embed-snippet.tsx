'use client';

import { useEffect, useState } from 'react';

export function EmbedSnippet({ id }: { id: string }) {
    const [origin, setOrigin] = useState('');
    useEffect(() => setOrigin(window.location.origin), []);

    const url = `${origin}/embed/${id}`;
    const iframe = `<iframe src="${url}" width="800" height="600" frameborder="0"></iframe>`;

    return (
        <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Embed</h2>
            <div>
                <div className="mb-1 text-xs text-muted-foreground">
                    URL (paste into Notion Embed block)
                </div>
                <pre className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-xs">
                    {url || `…/embed/${id}`}
                </pre>
            </div>
            <div>
                <div className="mb-1 text-xs text-muted-foreground">HTML iframe</div>
                <pre className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-xs">
                    {iframe}
                </pre>
            </div>
        </section>
    );
}
