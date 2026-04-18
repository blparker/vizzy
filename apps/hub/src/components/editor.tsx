'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { BeforeMount, OnMount } from '@monaco-editor/react';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

let libsRegistered = false;
let themesRegistered = false;

function configureTs(monaco: Parameters<BeforeMount>[0]) {
    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowNonTsExtensions: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        noEmit: true,
        strict: false,
        jsx: ts.JsxEmit.Preserve,
        lib: ['es2022', 'dom'],
    });
    ts.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        diagnosticCodesToIgnore: [1375, 1378],
    });
}

async function registerGithubThemes(monaco: Parameters<OnMount>[1]) {
    if (themesRegistered) return;
    themesRegistered = true;
    try {
        const [dark, light] = await Promise.all([
            fetch('/monaco-themes/github-dark.json').then((r) => r.json()),
            fetch('/monaco-themes/github-light.json').then((r) => r.json()),
        ]);
        monaco.editor.defineTheme('github-dark', dark);
        monaco.editor.defineTheme('github-light', light);
    } catch {
        // fall back silently to default themes
    }
}

async function registerVizzyTypes(monaco: Parameters<OnMount>[1]) {
    if (libsRegistered) return;
    libsRegistered = true;

    const ts = monaco.languages.typescript;
    try {
        const res = await fetch('/vizzy-types.json');
        if (!res.ok) return;
        const files = (await res.json()) as Record<string, string>;
        for (const [path, content] of Object.entries(files)) {
            ts.typescriptDefaults.addExtraLib(content, `file://${path}`);
        }
    } catch {
        // Types unavailable; editor still works, just without autocomplete.
    }
}

export function Editor({ value, onChange }: EditorProps) {
    const { resolvedTheme } = useTheme();
    const monacoTheme = resolvedTheme === 'light' ? 'github-light' : 'github-dark';

    const beforeMount: BeforeMount = (monaco) => configureTs(monaco);
    const onMount: OnMount = async (_editor, monaco) => {
        await registerGithubThemes(monaco);
        monaco.editor.setTheme(monacoTheme);
        void registerVizzyTypes(monaco);
    };

    return (
        <Monaco
            height="100%"
            defaultLanguage="typescript"
            defaultPath="file:///viz.mts"
            theme={monacoTheme}
            value={value}
            onChange={(v) => onChange(v ?? '')}
            beforeMount={beforeMount}
            onMount={onMount}
            options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                scrollBeyondLastLine: false,
                tabSize: 4,
                padding: { top: 12 },
            }}
        />
    );
}
