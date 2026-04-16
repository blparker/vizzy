import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { transpileTs } from '@/lib/transpile';
import { renderEmbed } from '@/lib/embed-template';

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
        return NextResponse.json({ ok: false, errors: result.errors });
    }

    const html = renderEmbed({
        title: body.title ?? 'preview',
        compiledJs: result.code,
    });

    return NextResponse.json({ ok: true, html });
}
