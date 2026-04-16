import { NextResponse } from 'next/server';
import { transpileTs } from '@/lib/transpile';
import { renderEmbed, type EmbedTheme } from '@/lib/embed-template';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    const body = (await req.json().catch(() => null)) as
        | { title?: string; code?: string; theme?: EmbedTheme }
        | null;
    if (!body || typeof body.code !== 'string') {
        return NextResponse.json({ error: 'invalid body' }, { status: 400 });
    }

    const result = await transpileTs(body.code);
    if (!result.ok) {
        return NextResponse.json({ ok: false, errors: result.errors });
    }

    const origin = new URL(req.url).origin;

    const html = renderEmbed({
        title: body.title ?? 'preview',
        compiledJs: result.code,
        theme: body.theme === 'light' ? 'light' : 'dark',
        runtimeUrl: `${origin}/vizzy-runtime.js`,
    });

    return NextResponse.json({ ok: true, html });
}
