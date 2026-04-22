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
    const attrColor = theme === 'dark' ? 'rgba(235, 235, 245, 0.45)' : 'rgba(60, 60, 67, 0.55)';
    const attrHover = theme === 'dark' ? 'rgba(235, 235, 245, 0.85)' : 'rgba(60, 60, 67, 0.9)';

    const runtimeImport = JSON.stringify(runtimeUrl + '?v=' + Date.now());
    const themeLiteral = JSON.stringify(theme);

    const styles = `
        *, *::before, *::after {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            background: ${bg};
            overflow: hidden;
        }
        #wrap {
            width: 100%;
            height: 100%;
            padding: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #stage {
            position: relative;
            display: inline-block;
        }
        #c {
            display: block;
            border-radius: 8px;
            border: 1px solid ${border};
        }
        #vizzy-attr {
            position: absolute;
            left: 8px;
            bottom: 6px;
            font: 10px/1 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            color: ${attrColor};
            text-decoration: none;
            letter-spacing: 0.02em;
            padding: 2px 4px;
            border-radius: 4px;
            pointer-events: auto;
            transition: color 120ms ease;
        }
        #vizzy-attr:hover {
            color: ${attrHover};
        }
        #vizzy-replay {
            position: absolute;
            right: 8px;
            bottom: 6px;
            width: 24px;
            height: 24px;
            display: none;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            color: ${attrColor};
            cursor: pointer;
            border-radius: 4px;
            transition: color 120ms ease, background 120ms ease;
        }
        #vizzy-replay:hover:not([disabled]) {
            color: ${attrHover};
        }
        #vizzy-replay[disabled] {
            cursor: default;
            opacity: 0.5;
        }
        #vizzy-replay svg {
            width: 14px;
            height: 14px;
        }`;

    const bootScript = `
        import * as vizzy from ${runtimeImport};

        const canvas = document.getElementById('c');
        const wrap = document.getElementById('wrap');
        const btn = document.getElementById('vizzy-replay');

        const ICONS = {
            pause: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="0.5"/><rect x="9" y="3" width="3" height="10" rx="0.5"/></svg>',
            resume: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.5v9a0.5 0.5 0 0 0 0.77 0.42l7-4.5a0.5 0.5 0 0 0 0-0.84l-7-4.5A0.5 0.5 0 0 0 5 3.5z"/></svg>',
            replay: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89"/><path d="M13.5 3v3h-3"/></svg>',
        };
        const LABELS = { pause: 'Pause animation', resume: 'Resume animation', replay: 'Replay animation' };

        let scene;
        let hasAnimation = false;
        let state = 'hidden';

        function setState(next) {
            state = next;
            if (next === 'hidden') {
                btn.style.display = 'none';
                return;
            }
            btn.style.display = 'flex';
            btn.innerHTML = ICONS[next];
            btn.setAttribute('aria-label', LABELS[next]);
            btn.title = LABELS[next];
        }

        function mountScene() {
            scene = vizzy.createScene(canvas, {
                theme: ${themeLiteral},
                autoResize: { container: wrap },
            });

            const { add, remove, play, wait, grid, render, controls, interact } = scene;
            const wrappedPlay = (...args) => {
                hasAnimation = true;
                if (state === 'hidden') setState('pause');
                return play(...args);
            };
            const wrappedWait = (...args) => {
                hasAnimation = true;
                if (state === 'hidden') setState('pause');
                return wait(...args);
            };
            Object.assign(globalThis, vizzy, {
                scene, add, remove, play: wrappedPlay, wait: wrappedWait, grid, render, controls, interact,
            });
        }

        async function runUserCode() {
            try {
${compiledJs}
            } catch (err) {
                console.error('[vizzy] user code error:', err);
            }
        }

        async function runOnce() {
            hasAnimation = false;
            setState('hidden');
            mountScene();
            await runUserCode();
            scene.render();
            setState(hasAnimation ? 'replay' : 'hidden');
        }

        btn.addEventListener('click', () => {
            if (state === 'pause') {
                scene.pause();
                setState('resume');
            } else if (state === 'resume') {
                scene.resume();
                setState('pause');
            } else if (state === 'replay') {
                scene.destroy();
                runOnce();
            }
        });

        runOnce();`;

    return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)} · vizzy</title>
        <style>${styles}
        </style>
    </head>
    <body>
        <div id="wrap">
            <div id="stage">
                <canvas id="c" width="1400" height="800"></canvas>
                <a id="vizzy-attr" href="https://vizzyjs.dev?ref=hub-embed" target="_blank" rel="noopener">Made with Vizzy</a>
                <button id="vizzy-replay" type="button"></button>
            </div>
        </div>
        <script type="module">${bootScript}
        </script>
    </body>
</html>`;
}
