import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { db, schema } from '@/db/client';
import { EmbedSnippet } from '@/components/embed-snippet';

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
        <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-8">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-100">{viz.title}</h1>
                    <p className="mt-1 text-xs text-neutral-500">
                        created {new Date(viz.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isOwner && (
                        <Link
                            href={`/v/${viz.id}/edit`}
                            className="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-900"
                        >
                            Edit
                        </Link>
                    )}
                </div>
            </header>

            <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
                <iframe
                    src={`/embed/${viz.id}`}
                    className="aspect-[4/3] w-full border-0"
                    sandbox="allow-scripts"
                    title={viz.title}
                />
            </div>

            <EmbedSnippet id={viz.id} />

            <section>
                <h2 className="mb-2 text-sm font-medium text-neutral-400">Source</h2>
                <pre className="overflow-x-auto rounded border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-300">
                    <code>{viz.codeTs}</code>
                </pre>
            </section>
        </main>
    );
}
