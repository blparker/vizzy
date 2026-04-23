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

    // ETag ties the cache entry to the viz's updatedAt + effective theme so any
    // save (or ?theme= override) invalidates. Pairs with Cache-Control: no-cache
    // to force revalidation on every request; unchanged vizzes return a tiny 304.
    const etag = `"${viz.id}-${viz.updatedAt.getTime()}-${theme}"`;
    const baseHeaders = {
        'Cache-Control': 'public, no-cache',
        ETag: etag,
        'Content-Security-Policy': 'frame-ancestors *',
    };

    if (req.headers.get('if-none-match') === etag) {
        return new NextResponse(null, { status: 304, headers: baseHeaders });
    }

    const html = renderEmbed({
        title: viz.title,
        compiledJs: viz.codeJs,
        theme,
    });

    return new NextResponse(html, {
        status: 200,
        headers: {
            ...baseHeaders,
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}
