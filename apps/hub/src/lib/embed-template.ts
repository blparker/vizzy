function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export type EmbedTheme = 'light' | 'dark';

export interface EmbedOptions {
    title: string;
    compiledJs: string;
    runtimeUrl?: string;
    theme?: EmbedTheme;
}

export function renderEmbed({
    title,
    compiledJs,
    runtimeUrl = '/vizzy-runtime.js',
    theme = 'dark',
}: EmbedOptions): string {
    const bg = theme === 'dark' ? '#202127' : '#f6f6f7';
    const border = theme === 'dark' ? 'rgba(84, 84, 84, 0.48)' : 'rgba(60, 60, 60, 0.12)';
    const attrColor = theme === 'dark' ? 'rgba(235, 235, 245, 0.55)' : 'rgba(60, 60, 67, 0.6)';
    const attrHover = theme === 'dark' ? 'rgba(235, 235, 245, 0.85)' : 'rgba(60, 60, 67, 0.9)';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} · vizzy</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; background: ${bg}; overflow: hidden; }
#wrap { width: 100%; height: 100%; padding: 16px; display: flex; align-items: center; justify-content: center; }
#c { display: block; border-radius: 8px; border: 1px solid ${border}; }
#vizzy-attr {
    position: fixed;
    bottom: 6px;
    right: 10px;
    font: 11px/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color: ${attrColor};
    text-decoration: none;
    letter-spacing: 0.01em;
    padding: 2px 4px;
    border-radius: 4px;
    transition: color 120ms ease;
}
#vizzy-attr:hover { color: ${attrHover}; }
</style>
</head>
<body>
<div id="wrap"><canvas id="c" width="1400" height="800"></canvas></div>
<a id="vizzy-attr" href="https://vizzyjs.dev?ref=hub-embed" target="_blank" rel="noopener">Made with Vizzy</a>
<script type="module">
import * as vizzy from ${JSON.stringify(runtimeUrl + '?v=' + Date.now())};
const canvas = document.getElementById('c');
const scene = vizzy.createScene(canvas, { theme: ${JSON.stringify(theme)}, autoResize: true });
const { add, remove, play, wait, grid, render, controls, interact } = scene;
Object.assign(globalThis, vizzy, { scene, add, remove, play, wait, grid, render, controls, interact });
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
