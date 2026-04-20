import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db, schema } from '@/db/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { VizCard } from '@/components/viz-card';

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const vizzes = await db.query.vizzes.findMany({
        where: eq(schema.vizzes.ownerId, userId),
        orderBy: desc(schema.vizzes.updatedAt),
        limit: 100,
    });

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center gap-3 border-b px-5 py-3">
                <Button asChild variant="ghost">
                    <Link href="/">
                        <ArrowLeft className="size-4" />
                        vizzy hub
                    </Link>
                </Button>
                <div className="flex-1" />
                <ThemeToggle />
                <UserButton />
            </header>

            <main className="mx-auto max-w-5xl px-5 py-10">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">My vizzes</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{vizzes.length} saved</p>
                    </div>
                    <Button asChild>
                        <Link href="/">New viz</Link>
                    </Button>
                </div>

                {vizzes.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-16 text-center text-muted-foreground">
                        No vizzes yet.{' '}
                        <Link href="/" className="text-foreground underline-offset-4 hover:underline">
                            Create one
                        </Link>
                        .
                    </div>
                ) : (
                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {vizzes.map((v) => (
                            <li key={v.id}>
                                <VizCard id={v.id} title={v.title} updatedAt={v.updatedAt} />
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
