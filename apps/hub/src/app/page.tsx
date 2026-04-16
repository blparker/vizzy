import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default async function LandingPage() {
    const { userId } = await auth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-100 sm:text-5xl">
                vizzy hub
            </h1>
            <p className="mt-4 max-w-xl text-neutral-400">
                Create math visualizations in your browser. Save them. Get a stable URL. Drop them into
                Notion, a blog post, or anywhere an iframe works.
            </p>
            <div className="mt-10 flex items-center gap-3">
                {userId ? (
                    <>
                        <Link
                            href="/new"
                            className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                        >
                            New viz
                        </Link>
                        <Link
                            href="/dashboard"
                            className="rounded border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
                        >
                            My vizzes
                        </Link>
                    </>
                ) : (
                    <>
                        <SignUpButton>
                            <button className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500">
                                Get started
                            </button>
                        </SignUpButton>
                        <SignInButton>
                            <button className="rounded border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-900">
                                Sign in
                            </button>
                        </SignInButton>
                    </>
                )}
            </div>
        </main>
    );
}
