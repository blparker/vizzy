'use client';

import dynamic from 'next/dynamic';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
    return (
        <Monaco
            height="100%"
            defaultLanguage="typescript"
            theme="vs-dark"
            value={value}
            onChange={(v) => onChange(v ?? '')}
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
