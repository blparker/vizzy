import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { db, schema } from '@/db/client';
import { VizEditorPage } from '@/components/viz-editor-page';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VizEditPage({ params }: Props) {
    const { id } = await params;
    const viz = await db.query.vizzes.findFirst({ where: eq(schema.vizzes.id, id) });
    if (!viz) notFound();

    const { userId } = await auth();
    if (userId !== viz.ownerId) redirect(`/v/${viz.id}`);

    return (
        <VizEditorPage
            isAuthed
            initialId={viz.id}
            initialTitle={viz.title}
            initialCode={viz.codeTs}
        />
    );
}
