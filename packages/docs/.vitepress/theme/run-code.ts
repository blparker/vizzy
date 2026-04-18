export async function runCode(
    canvas: HTMLCanvasElement,
    code: string,
    theme: 'dark' | 'light' = 'dark',
): Promise<{ error?: string }> {
    try {
        const core = await import('@vizzyjs/core');
        const renderer = await import('@vizzyjs/renderer-canvas');

        const modules: Record<string, unknown> = { ...core, ...renderer };
        const moduleNames = Object.keys(modules);
        const moduleValues = Object.values(modules);

        const prepared = code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');

        const wrappedCode = `
            const __bound__ = createScene(canvas, { theme: __theme__ });
            const { add, remove, play, wait, grid, render, controls, interact } = __bound__;
            ${prepared}
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
