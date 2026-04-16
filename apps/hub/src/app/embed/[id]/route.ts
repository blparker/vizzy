import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { renderEmbed, type EmbedTheme } from '@/lib/embed-template';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const viz = await db.query.vizzes.findFirst({ where: eq(schema.vizzes.id, id) });
    if (!viz) {
        return new NextResponse('not found', { status: 404 });
    }

    const url = new URL(req.url);
    const override = url.searchParams.get('theme');
    const theme: EmbedTheme =
        override === 'light' || override === 'dark' ? override : viz.theme;

    const html = renderEmbed({
        title: viz.title,
        compiledJs: viz.codeJs,
        theme,
    });

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
            'Content-Security-Policy': 'frame-ancestors *',
        },
    });
}
