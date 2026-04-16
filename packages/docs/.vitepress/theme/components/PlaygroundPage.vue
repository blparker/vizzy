<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { allSnippets } from '../../../snippets/index';

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const errorEl = ref('');
const errorVisible = ref(false);
const selectedIndex = ref(0);
const currentTheme = ref<'dark' | 'light'>('dark');

let editor: any = null;
let monacoModule: any = null;

const canvasDisplayWidth = 800;
const canvasDisplayHeight = 457;

async function runCode(canvas: HTMLCanvasElement, code: string, theme: 'dark' | 'light') {
    try {
        const core = await import('@vizzyjs/core');
        const renderer = await import('@vizzyjs/renderer-canvas');

        const modules: Record<string, unknown> = { ...core, ...renderer };
        const moduleNames = Object.keys(modules);
        const moduleValues = Object.values(modules);

        let prepared = code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');
        prepared = prepared.replace(/export\s+default\s+(async\s+)?function\s*\(/, '__fn__ = $1function(');
        prepared = prepared.replace(/export\s+default\s+(async\s+)?function\s+(\w+)\s*\(/, '__fn__ = $1function $2(');

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

        const hasAwait = /\bawait\b/.test(prepared);
        const FnCtor = hasAwait
            ? (Object.getPrototypeOf(async function () {}).constructor as typeof Function)
            : Function;
        const fn = new FnCtor('canvas', '__theme__', ...moduleNames, wrappedCode);
        const result = fn(canvas, theme, ...moduleValues);
        if (result && typeof result.then === 'function') {
            await result;
        }
    } catch (e) {
        errorEl.value = e instanceof Error ? e.message : String(e);
        errorVisible.value = true;
    }
}

async function initMonaco() {
    const monaco = await import('monaco-editor');
    monacoModule = monaco;

    // Configure workers
    (self as any).MonacoEnvironment = {
        getWorker(_workerId: string, label: string) {
            if (label === 'typescript' || label === 'javascript') {
                return new Worker(
                    new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
                    { type: 'module' },
                );
            }
            return new Worker(
                new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
                { type: 'module' },
            );
        },
    };

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false,
    });

    editor = monaco.editor.create(containerRef.value!, {
        value: '',
        language: 'typescript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        padding: { top: 12 },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());

    // Check for #code= hash param
    const hash = window.location.hash.slice(1);
    const codeMatch = hash.match(/^code=(.+)/);
    if (codeMatch) {
        try {
            const code = decodeURIComponent(atob(codeMatch[1]));
            editor.setValue(code);
            run();
            return;
        } catch {
            // fall through to default
        }
    }

    loadExample(0);
}

function loadExample(index: number) {
    const ex = allSnippets[index];
    if (!ex || !editor) return;
    selectedIndex.value = index;
    editor.setValue(ex.code);
    run();
}

function run() {
    const canvas = canvasRef.value;
    if (!canvas || !editor) return;

    errorEl.value = '';
    errorVisible.value = false;

    // Clean up previous controls panel
    const wrapper = canvas.parentElement;
    if (wrapper?.classList.contains('vizzy-container')) {
        wrapper.parentElement!.insertBefore(canvas, wrapper);
        wrapper.remove();
    }

    canvas.width = canvasDisplayWidth;
    canvas.height = canvasDisplayHeight;
    canvas.style.width = '';
    canvas.style.height = '';

    runCode(canvas, editor.getValue(), currentTheme.value);
}

function toggleTheme() {
    const theme = currentTheme.value === 'dark' ? 'light' : 'dark';
    currentTheme.value = theme;
    if (monacoModule) {
        monacoModule.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
    run();
}

function onExampleChange(e: Event) {
    loadExample(Number((e.target as HTMLSelectElement).value));
}

onMounted(async () => {
    await nextTick();
    initMonaco();
});
</script>

<template>
    <div class="playground">
        <div class="playground__toolbar">
            <label for="pg-examples">Example:</label>
            <select id="pg-examples" :value="selectedIndex" @change="onExampleChange">
                <option v-for="(ex, i) in allSnippets" :key="i" :value="i">{{ ex.title }}</option>
            </select>
            <div class="playground__spacer" />
            <button class="playground__btn playground__btn--theme" @click="toggleTheme">
                {{ currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark' }}
            </button>
            <button class="playground__btn playground__btn--run" @click="run">
                Run (⌘ Enter)
            </button>
        </div>
        <div class="playground__panels">
            <div class="playground__editor">
                <div ref="containerRef" class="playground__editor-inner" />
            </div>
            <div class="playground__canvas-panel" :class="{ 'playground__canvas-panel--light': currentTheme === 'light' }">
                <canvas
                    ref="canvasRef"
                    :width="canvasDisplayWidth"
                    :height="canvasDisplayHeight"
                    class="playground__canvas"
                />
                <div v-if="errorVisible" class="playground__error">{{ errorEl }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.playground {
    position: fixed;
    top: var(--vp-nav-height);
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    grid-template-rows: auto 1fr;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.playground__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #1e1e1e;
    border-bottom: 1px solid #333;
}

.playground__toolbar label {
    color: #aaa;
    font-size: 13px;
}

.playground__toolbar select {
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #555;
    background: #2d2d2d;
    color: #e0e0e0;
    font-size: 13px;
}

.playground__spacer {
    flex: 1;
}

.playground__btn {
    padding: 5px 16px;
    border-radius: 4px;
    border: 1px solid #555;
    font-size: 13px;
    cursor: pointer;
}

.playground__btn--run {
    background: #2d5a2d;
    color: #c0e0c0;
}

.playground__btn--run:hover {
    background: #3a7a3a;
}

.playground__btn--theme {
    background: #3a3a3a;
    color: #ccc;
}

.playground__btn--theme:hover {
    background: #4a4a4a;
}

.playground__panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
}

.playground__editor {
    background: #1e1e1e;
    overflow: hidden;
}

.playground__editor-inner {
    width: 100%;
    height: 100%;
}

.playground__canvas-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    padding: 16px;
    gap: 8px;
}

.playground__canvas-panel--light {
    background: #ffffff;
}

.playground__canvas {
    border-radius: 5px;
    border: 1px solid #ccc;
    max-width: 100%;
    height: auto;
}

.playground__error {
    color: #e05050;
    background: #2a1515;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-width: 800px;
    width: 100%;
    white-space: pre-wrap;
}
</style>
