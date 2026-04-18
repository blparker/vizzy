// Walks the dist/*.d.ts trees of the vizzy workspace packages and produces
// a JSON map { "/node_modules/@vizzyjs/<pkg>/<path>": "<content>", ... }
// plus fake package.json entries and an ambient globals file.
// The editor loads this map at mount and registers each entry with Monaco's
// TypeScript language service.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
const hubRoot = resolve(__dirname, '..');

const packages = [
    { name: '@vizzyjs/core', dir: 'packages/core' },
    { name: '@vizzyjs/renderer-canvas', dir: 'packages/renderer-canvas' },
];

async function walk(dir) {
    const out = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...(await walk(full)));
        else if (entry.isFile() && entry.name.endsWith('.d.ts')) out.push(full);
    }
    return out;
}

const files = {};

for (const pkg of packages) {
    const distDir = resolve(repoRoot, pkg.dir, 'dist');
    const dtsFiles = await walk(distDir);
    for (const abs of dtsFiles) {
        const rel = relative(distDir, abs);
        const path = `/node_modules/${pkg.name}/dist/${rel.replace(/\\/g, '/')}`;
        files[path] = await readFile(abs, 'utf8');
    }
    files[`/node_modules/${pkg.name}/package.json`] = JSON.stringify({
        name: pkg.name,
        version: '0.0.0',
        types: 'dist/index.d.ts',
        main: 'dist/index.js',
    });
}

// Programmatically discover every runtime export from core + renderer-canvas.
// The hub sandbox spreads these onto globalThis, so Monaco should see each as a global.
const coreMod = await import('@vizzyjs/core');
const rendererMod = await import('@vizzyjs/renderer-canvas');

// Scene methods are declared separately with BoundScene types — skip any core/renderer
// export that shares a name so we don't emit duplicate `const X` declarations.
const sceneMethods = new Set(['add', 'remove', 'play', 'wait', 'grid', 'render', 'controls', 'interact', 'scene', 'canvas']);

const coreNames = Object.keys(coreMod).filter((n) => n !== 'default' && !sceneMethods.has(n));
const rendererNames = Object.keys(rendererMod).filter(
    (n) => n !== 'default' && !sceneMethods.has(n) && !coreNames.includes(n),
);

const coreDecls = coreNames
    .map((n) => `    const ${n}: typeof import('@vizzyjs/core').${n};`)
    .join('\n');
const rendererDecls = rendererNames
    .map((n) => `    const ${n}: typeof import('@vizzyjs/renderer-canvas').${n};`)
    .join('\n');

files['/vizzy-globals.d.ts'] = `
import type { BoundScene } from '@vizzyjs/renderer-canvas';

declare global {
${coreDecls}
${rendererDecls}
    const scene: BoundScene;
    const add: BoundScene['add'];
    const remove: BoundScene['remove'];
    const play: BoundScene['play'];
    const wait: BoundScene['wait'];
    const grid: BoundScene['grid'];
    const render: BoundScene['render'];
    const controls: BoundScene['controls'];
    const interact: BoundScene['interact'];
}

export {};
`;

const dest = resolve(hubRoot, 'public/vizzy-types.json');
await mkdir(dirname(dest), { recursive: true });
await writeFile(dest, JSON.stringify(files), 'utf8');

const total = Object.keys(files).length;
const bytes = JSON.stringify(files).length;
console.log(`✓ built ${dest} (${total} files, ${bytes} bytes)`);
