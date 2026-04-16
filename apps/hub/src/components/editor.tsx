'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { BeforeMount, OnMount } from '@monaco-editor/react';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

// Module-scoped so we only register extra libs once per page load,
// even if the editor remounts (e.g. via React strict mode).
let libsRegistered = false;

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
        // Silence "top-level await" warnings — the runtime wraps user code
        // in an async IIFE, so top-level await is always legal here.
        //   1375: 'await' at the top level only allowed when file is a module
        //   1378: Top-level 'await' expressions require module esnext/es2022/...
        diagnosticCodesToIgnore: [1375, 1378],
    });
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
        // Types unavailable — editor still works, just without autocomplete.
    }
}

export function Editor({ value, onChange }: EditorProps) {
    const { resolvedTheme } = useTheme();
    const monacoTheme = resolvedTheme === 'light' ? 'vs' : 'vs-dark';

    const beforeMount: BeforeMount = (monaco) => configureTs(monaco);
    const onMount: OnMount = (_editor, monaco) => {
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
            }}
        />
    );
}
