import { headers } from 'next/headers';
import { CodeBlock } from '@/components/code-block';

async function getOrigin(): Promise<string> {
    const h = await headers();
    const host = h.get('host') ?? 'hub.vizzyjs.dev';
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
}

export async function EmbedSnippet({ id }: { id: string }) {
    const origin = await getOrigin();
    const url = `${origin}/embed/${id}`;
    const iframe = `<iframe src="${url}" width="800" height="600" frameborder="0"></iframe>`;

    return (
        <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Embed</h2>
            <div>
                <div className="mb-1 text-xs text-muted-foreground">
                    URL (paste into Notion Embed block)
                </div>
                <CodeBlock code={url} lang="text" />
            </div>
            <div>
                <div className="mb-1 text-xs text-muted-foreground">HTML iframe</div>
                <CodeBlock code={iframe} lang="html" />
            </div>
        </section>
    );
}
