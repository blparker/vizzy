import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

await build({
    stdin: {
        contents: `
export * from '@vizzyjs/core';
export * from '@vizzyjs/renderer-canvas';
`,
        resolveDir: root,
        loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    target: 'es2022',
    outfile: resolve(root, 'public/vizzy-runtime.js'),
    sourcemap: true,
    minify: true,
    external: ['katex'],
    logLevel: 'info',
});

console.log('✓ built public/vizzy-runtime.js');
