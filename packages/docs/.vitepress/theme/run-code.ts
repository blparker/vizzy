export async function runCode(
    canvas: HTMLCanvasElement,
    code: string,
    theme: 'dark' | 'light' = 'dark',
): Promise<{ error?: string }> {
    try {
        const core = await import('@vizzyjs/core');
        const renderer = await import('@vizzyjs/renderer-canvas');

        const modules: Record<string, unknown> = { ...core, ...renderer };
        // Scene methods win: remove any core export that shares a name with a scene method.
        const SCENE_METHODS = ['add', 'remove', 'play', 'wait', 'grid', 'render', 'controls', 'interact', 'scene', 'canvas'];
        for (const name of SCENE_METHODS) delete modules[name];
        const moduleNames = Object.keys(modules);
        const moduleValues = Object.values(modules);

        const prepared = code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');

        // User code runs in a nested block so their top-level `const` / `let` declarations
        // can safely shadow module exports with the same name (e.g. `const dot = ...`,
        // which would otherwise collide with core's `dot` vector helper).
        const wrappedCode = `
            const __bound__ = createScene(canvas, { theme: __theme__ });
            const { add, remove, play, wait, grid, render, controls, interact } = __bound__;
            {
                ${prepared}
            }
            __bound__.render();
            return __bound__;
        `;

        const hasAwait = /\bawait\b/.test(prepared);
        const FnCtor = hasAwait
            ? (Object.getPrototypeOf(async function () {}).constructor as typeof Function)
            : Function;
        const fn = new FnCtor('canvas', '__theme__', ...moduleNames, wrappedCode);
        const result = fn(canvas, theme, ...moduleValues);
        if (result && typeof result.then === 'function') {
            await result;
        }
        return {};
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}
