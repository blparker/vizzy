'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Editor } from './editor';
import { VizPreview } from './viz-preview';

const DRAFT_KEY = 'vizzy-hub:draft:v2';

export interface VizEditorPageProps {
    isAuthed: boolean;
    initialId?: string;
    initialTitle: string;
    initialCode: string;
}

const DEFAULT_CODE = `// Welcome to vizzy hub. Write a scene and see it render on the right.
// All @vizzyjs/core exports (shapes, colors, animations) are available as globals,
// along with \`add\`, \`play\`, \`wait\`, \`grid\`, \`controls\`, and \`interact\`.

grid();

const c = circle({ radius: 1, color: sky });
add(c);

await play(fadeIn(c));
`;

export function VizEditorPage({
    isAuthed,
    initialId,
    initialTitle,
    initialCode,
}: VizEditorPageProps) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [title, setTitle] = useState(initialTitle);
    const [code, setCode] = useState(initialCode || DEFAULT_CODE);
    const [saving, startSaving] = useTransition();
    const [saveError, setSaveError] = useState<string | null>(null);
    const hydratedRef = useRef(false);

    useEffect(() => {
        if (initialId || initialCode || hydratedRef.current) return;
        hydratedRef.current = true;
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw) as { title?: string; code?: string };
            if (draft.code) setCode(draft.code);
            if (draft.title) setTitle(draft.title);
        } catch {
            // ignore
        }
    }, [initialId, initialCode]);

    useEffect(() => {
        if (initialId) return;
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, code }));
        } catch {
            // ignore
        }
    }, [title, code, initialId]);

    const onSave = () => {
        setSaveError(null);
        startSaving(async () => {
            const url = initialId ? `/api/vizzes/${initialId}` : '/api/vizzes';
            const method = initialId ? 'PATCH' : 'POST';
            const theme = resolvedTheme === 'light' ? 'light' : 'dark';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, code, theme }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSaveError(data.error ?? `save failed (${res.status})`);
                return;
            }
            const id = data.id ?? initialId;
            if (!initialId && id) {
                try {
                    localStorage.removeItem(DRAFT_KEY);
                } catch {
                    /* noop */
                }
                router.push(`/v/${id}/edit`);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <div className="flex h-screen flex-col bg-background text-foreground">
            <header className="flex items-center gap-3 border-b px-5 py-3">
                <Link
                    href="/"
                    className="text-base font-semibold tracking-tight hover:text-foreground/80"
                >
                    vizzy hub
                </Link>
                <span className="text-muted-foreground/50">/</span>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled viz"
                    className="h-9 max-w-xs border-none bg-transparent shadow-none focus-visible:ring-0"
                />
                <div className="flex-1" />
                {saveError && <span className="text-xs text-destructive">{saveError}</span>}

                {isAuthed ? (
                    <>
                        <Button onClick={onSave} disabled={saving}>
                            {saving ? 'Saving…' : initialId ? 'Save' : 'Create'}
                        </Button>
                        {initialId && (
                            <Button asChild variant="ghost">
                                <a href={`/v/${initialId}`} target="_blank" rel="noreferrer">
                                    View
                                </a>
                            </Button>
                        )}
                        <Button asChild variant="ghost">
                            <Link href="/dashboard">My vizzes</Link>
                        </Button>
                        <ThemeToggle />
                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                    </>
                ) : (
                    <SignedOut>
                        <SignUpButton
                            mode="modal"
                            forceRedirectUrl="/"
                            signInForceRedirectUrl="/"
                        >
                            <Button>Sign up to save</Button>
                        </SignUpButton>
                        <SignInButton mode="modal" forceRedirectUrl="/">
                            <Button variant="ghost">Sign in</Button>
                        </SignInButton>
                        <ThemeToggle />
                    </SignedOut>
                )}
            </header>
            <div className="grid flex-1 grid-cols-2 overflow-hidden">
                <div className="border-r">
                    <Editor value={code} onChange={setCode} />
                </div>
                <VizPreview code={code} title={title} />
            </div>
        </div>
    );
}
