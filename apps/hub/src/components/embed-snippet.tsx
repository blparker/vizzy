'use client';

import { useEffect, useState } from 'react';

export function EmbedSnippet({ id }: { id: string }) {
    const [origin, setOrigin] = useState('');
    useEffect(() => setOrigin(window.location.origin), []);

    const url = `${origin}/embed/${id}`;
    const iframe = `<iframe src="${url}" width="800" height="600" frameborder="0"></iframe>`;

    return (
        <section>
            <h2 className="mb-2 text-sm font-medium text-neutral-400">Embed</h2>
            <div className="space-y-2">
                <div>
                    <div className="text-xs text-neutral-500">URL (paste into Notion Embed block)</div>
                    <pre className="overflow-x-auto rounded border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300">
                        {url || `…/embed/${id}`}
                    </pre>
                </div>
                <div>
                    <div className="text-xs text-neutral-500">HTML iframe</div>
                    <pre className="overflow-x-auto rounded border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300">
                        {iframe}
                    </pre>
                </div>
            </div>
        </section>
    );
}
