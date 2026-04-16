import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const vizzes = await db.query.vizzes.findMany({
        where: eq(schema.vizzes.ownerId, userId),
        orderBy: desc(schema.vizzes.updatedAt),
        limit: 100,
    });

    return (
        <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-neutral-100">My vizzes</h1>
                <Link
                    href="/new"
                    className="rounded bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500"
                >
                    New viz
                </Link>
            </header>

            {vizzes.length === 0 ? (
                <div className="rounded border border-dashed border-neutral-800 p-10 text-center text-neutral-500">
                    No vizzes yet. <Link href="/new" className="text-sky-400 hover:underline">Create one</Link>.
                </div>
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                    {vizzes.map((v) => (
                        <li key={v.id}>
                            <Link
                                href={`/v/${v.id}/edit`}
                                className="block rounded border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-700"
                            >
                                <div className="text-sm font-medium text-neutral-100">{v.title}</div>
                                <div className="mt-1 text-xs text-neutral-500">
                                    {v.id} · updated {new Date(v.updatedAt).toLocaleDateString()}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
