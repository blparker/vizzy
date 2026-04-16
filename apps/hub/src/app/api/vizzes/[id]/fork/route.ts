import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, schema } from '@/db/client';

export const runtime = 'nodejs';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const source = await db.query.vizzes.findFirst({ where: eq(schema.vizzes.id, id) });
    if (!source) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    const newId = nanoid(10);
    await db.insert(schema.vizzes).values({
        id: newId,
        ownerId: userId,
        title: source.title,
        codeTs: source.codeTs,
        codeJs: source.codeJs,
        theme: source.theme,
        forkedFrom: source.id,
    });

    return NextResponse.json({ id: newId });
}
