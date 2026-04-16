import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { transpileTs } from '@/lib/transpile';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.query.vizzes.findFirst({ where: eq(schema.vizzes.id, id) });
    if (!existing) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    if (existing.ownerId !== userId) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as
        | { title?: string; code?: string }
        | null;
    if (!body) {
        return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }

    const update: Partial<typeof schema.vizzes.$inferInsert> = {
        updatedAt: new Date(),
    };
    if (typeof body.title === 'string') update.title = body.title.slice(0, 200);
    if (typeof body.code === 'string') {
        const result = await transpileTs(body.code);
        if (!result.ok) {
            return NextResponse.json({ error: 'transpile failed', errors: result.errors }, { status: 400 });
        }
        update.codeTs = body.code;
        update.codeJs = result.code;
    }

    await db.update(schema.vizzes).set(update).where(eq(schema.vizzes.id, id));
    return NextResponse.json({ id });
}
