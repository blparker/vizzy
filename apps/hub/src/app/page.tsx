import { auth } from '@clerk/nextjs/server';
import { VizEditorPage } from '@/components/viz-editor-page';

interface Props {
    searchParams: Promise<{ code?: string }>;
}

function decodeSharedCode(encoded: string | undefined): string {
    if (!encoded) return '';
    try {
        return decodeURIComponent(atob(encoded));
    } catch {
        return '';
    }
}

export default async function HomePage({ searchParams }: Props) {
    const { code } = await searchParams;
    const { userId } = await auth();
    return (
        <VizEditorPage
            isAuthed={!!userId}
            initialTitle=""
            initialCode={decodeSharedCode(code)}
        />
    );
}
