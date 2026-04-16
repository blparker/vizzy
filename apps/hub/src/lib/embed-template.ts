function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export interface EmbedOptions {
    title: string;
    compiledJs: string;
    width?: number;
    height?: number;
    runtimeUrl?: string;
}

export function renderEmbed({
    title,
    compiledJs,
    width = 800,
    height = 600,
    runtimeUrl = '/vizzy-runtime.js',
}: EmbedOptions): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} · vizzy</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; background: #0b0b0e; }
body { display: flex; align-items: center; justify-content: center; overflow: hidden; }
#c { display: block; max-width: 100%; max-height: 100%; }
</style>
</head>
<body>
<canvas id="c" width="${width}" height="${height}"></canvas>
<script type="module">
import * as vizzy from ${JSON.stringify(runtimeUrl)};
const canvas = document.getElementById('c');
const scene = vizzy.createScene(canvas);
Object.assign(globalThis, { vizzy, scene });
const { add, play, wait, grid, render } = scene;
(async () => {
try {
${compiledJs}
} catch (err) {
console.error('[vizzy] user code error:', err);
}
})();
scene.render();
</script>
</body>
</html>`;
}
