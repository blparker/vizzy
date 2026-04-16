import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { db, schema } from '@/db/client';
import { transpileTs } from '@/lib/transpile';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
        | { title?: string; code?: string }
        | null;
    if (!body || typeof body.code !== 'string') {
        return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }

    const result = await transpileTs(body.code);
    if (!result.ok) {
        return NextResponse.json({ error: 'transpile failed', errors: result.errors }, { status: 400 });
    }

    const id = nanoid(10);
    await db.insert(schema.vizzes).values({
        id,
        ownerId: userId,
        title: body.title?.slice(0, 200) || 'Untitled',
        codeTs: body.code,
        codeJs: result.code,
    });

    return NextResponse.json({ id });
}
