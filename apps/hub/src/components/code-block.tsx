import { codeToHtml, type BundledLanguage } from 'shiki';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';

export interface CodeBlockProps {
    code: string;
    lang?: BundledLanguage | 'text';
    className?: string;
}

export async function CodeBlock({ code, lang = 'typescript', className }: CodeBlockProps) {
    const html = await codeToHtml(code, {
        lang,
        themes: {
            light: 'github-light',
            dark: 'github-dark',
        },
        defaultColor: false,
    });

    return (
        <div className={cn('group relative overflow-hidden rounded-lg border bg-card', className)}>
            <div
                className="overflow-x-auto p-4 font-mono text-sm [&_pre]:!bg-transparent [&_pre]:!p-0"
                dangerouslySetInnerHTML={{ __html: html }}
            />
            <CopyButton text={code} className="absolute right-2 top-2" />
        </div>
    );
}
