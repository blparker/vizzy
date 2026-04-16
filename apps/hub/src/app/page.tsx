import { auth } from '@clerk/nextjs/server';
import { VizEditorPage } from '@/components/viz-editor-page';

export default async function HomePage() {
    const { userId } = await auth();
    return <VizEditorPage isAuthed={!!userId} initialTitle="" initialCode="" />;
}
