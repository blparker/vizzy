import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft } from 'lucide-react';
import { db, schema } from '@/db/client';
import { CodeBlock } from '@/components/code-block';
import { EmbedSnippet } from '@/components/embed-snippet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VizPreviewPage({ params }: Props) {
    const { id } = await params;
    const viz = await db.query.vizzes.findFirst({ where: eq(schema.vizzes.id, id) });
    if (!viz) notFound();

    const { userId } = await auth();
    const isOwner = userId === viz.ownerId;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center gap-3 border-b px-5 py-3">
                <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="size-4" />
                        vizzy hub
                    </Link>
                </Button>
                <div className="flex-1" />
                <ThemeToggle />
            </header>

            <main className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-10">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">{viz.title}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            created {new Date(viz.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {isOwner && (
                        <Button asChild variant="outline">
                            <Link href={`/v/${viz.id}/edit`}>Edit</Link>
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-lg border bg-card">
                    <iframe
                        src={`/embed/${viz.id}`}
                        className="aspect-[800/457] w-full border-0"
                        sandbox="allow-scripts"
                        title={viz.title}
                    />
                </div>

                <EmbedSnippet id={viz.id} />

                <section>
                    <h2 className="mb-2 text-sm font-medium text-muted-foreground">Source</h2>
                    <CodeBlock code={viz.codeTs} lang="typescript" />
                </section>
            </main>
        </div>
    );
}
