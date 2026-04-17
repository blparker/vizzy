'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Copy, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface VizCardProps {
    id: string;
    title: string;
    updatedAt: Date | string;
}

export function VizCard({ id, title, updatedAt }: VizCardProps) {
    const router = useRouter();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [deleting, startDelete] = useTransition();

    const onCopyEmbed = async () => {
        const url = `${window.location.origin}/embed/${id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const onDelete = () => {
        startDelete(async () => {
            const res = await fetch(`/api/vizzes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setConfirmOpen(false);
                router.refresh();
            }
        });
    };

    const updated = typeof updatedAt === 'string' ? new Date(updatedAt) : updatedAt;

    return (
        <>
            <article className="group relative overflow-hidden rounded-lg border bg-card transition hover:border-foreground/30">
                <Link href={`/v/${id}/edit`} className="block">
                    <div className="pointer-events-none relative aspect-[800/457] w-full overflow-hidden bg-muted/30">
                        <iframe
                            src={`/embed/${id}`}
                            className="pointer-events-none h-full w-full border-0"
                            sandbox="allow-scripts"
                            loading="lazy"
                            title={title}
                            tabIndex={-1}
                        />
                    </div>
                    <div className="border-t px-4 py-3">
                        <div className="truncate text-sm font-medium">{title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                            updated {updated.toLocaleDateString()}
                        </div>
                    </div>
                </Link>

                <div className="absolute right-2 top-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="secondary"
                                    size="icon-sm"
                                    className="bg-background/80 opacity-0 backdrop-blur transition group-hover:opacity-100 data-[popup-open]:opacity-100"
                                    aria-label="Viz actions"
                                >
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onCopyEmbed}>
                                <Copy className="size-4" />
                                {copied ? 'Copied!' : 'Copy embed link'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                render={<Link href={`/v/${id}`} target="_blank" />}
                            >
                                <ExternalLink className="size-4" />
                                Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setConfirmOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </article>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this viz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            “{title}” will be permanently deleted. Any embeds using its URL will break.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                onDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
