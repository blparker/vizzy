import 'katex/dist/katex.min.css';
import * as core from '@vizzyjs/core';
import * as rendererCanvas from '@vizzyjs/renderer-canvas';

const modules: Record<string, unknown> = {
    ...core,
    ...rendererCanvas,
};

const moduleNames = Object.keys(modules);
const moduleValues = Object.values(modules);

function prepareCode(code: string): string {
    // Strip import lines
    let prepared = code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');
    // Strip export default — convert to assignment (handles async too)
    prepared = prepared.replace(/export\s+default\s+(async\s+)?function\s*\(/, '__fn__ = $1function(');
    prepared = prepared.replace(/export\s+default\s+(async\s+)?function\s+(\w+)\s*\(/, '__fn__ = $1function $2(');
    return prepared;
}

export async function runCode(canvas: HTMLCanvasElement, code: string, theme: 'dark' | 'light' = 'dark'): Promise<{ error?: string }> {
    const prepared = prepareCode(code);

    // The user's code gets `canvas` and all vizzy exports in scope.
    // Two modes:
    //   1. export default function({ add, grid }) { ... }  — auto-wrapped in renderScene
    //   2. Direct: createScene / renderScene call           — full control (supports async)
    const wrappedCode = `
        let __fn__ = null;
        ${prepared}
        if (__fn__) {
            const __bound__ = createScene(canvas, { theme: __theme__ });
            const __result__ = __fn__(__bound__);
            if (__result__ && typeof __result__.then === 'function') {
                return __result__;
            }
            __bound__.render();
            return __bound__;
        }
    `;

    try {
        const hasAwait = /\bawait\b/.test(prepared);
        const FnCtor = hasAwait
            ? (Object.getPrototypeOf(async function () {}).constructor as typeof Function)
            : Function;
        const fn = new FnCtor(
            'canvas', '__theme__',
            ...moduleNames,
            wrappedCode,
        );
        const result = fn(canvas, theme, ...moduleValues);
        if (result && typeof result.then === 'function') {
            await result;
        }
        return {};
    } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) };
    }
}
