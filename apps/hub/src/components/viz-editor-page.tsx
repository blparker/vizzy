'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from './editor';
import { VizPreview } from './viz-preview';

export interface VizEditorPageProps {
    initialId?: string;
    initialTitle: string;
    initialCode: string;
}

const DEFAULT_CODE = `// Write your vizzy scene here.
// Available: scene (with add/play/wait/grid/render), and everything from @vizzyjs/core via the \`vizzy\` global.

grid();

const c = vizzy.circle({ radius: 1, color: vizzy.sky });
add(c);

await play(vizzy.fadeIn(c));
`;

export function VizEditorPage({ initialId, initialTitle, initialCode }: VizEditorPageProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialTitle);
    const [code, setCode] = useState(initialCode || DEFAULT_CODE);
    const [saving, startSaving] = useTransition();
    const [saveError, setSaveError] = useState<string | null>(null);

    const onSave = () => {
        setSaveError(null);
        startSaving(async () => {
            const url = initialId ? `/api/vizzes/${initialId}` : '/api/vizzes';
            const method = initialId ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, code }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSaveError(data.error ?? `save failed (${res.status})`);
                return;
            }
            const id = data.id ?? initialId;
            if (!initialId && id) router.push(`/v/${id}/edit`);
            else router.refresh();
        });
    };

    return (
        <div className="flex h-screen flex-col">
            <header className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-2">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled viz"
                    className="flex-1 bg-transparent text-sm text-neutral-100 outline-none placeholder:text-neutral-500"
                />
                {saveError && <span className="text-xs text-red-400">{saveError}</span>}
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="rounded bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
                >
                    {saving ? 'Saving…' : initialId ? 'Save' : 'Create'}
                </button>
                {initialId && (
                    <a
                        href={`/v/${initialId}`}
                        className="text-xs text-neutral-400 hover:text-neutral-200"
                        target="_blank"
                    >
                        view
                    </a>
                )}
            </header>
            <div className="grid flex-1 grid-cols-2 overflow-hidden">
                <div className="border-r border-neutral-800">
                    <Editor value={code} onChange={setCode} />
                </div>
                <VizPreview code={code} title={title} />
            </div>
        </div>
    );
}
