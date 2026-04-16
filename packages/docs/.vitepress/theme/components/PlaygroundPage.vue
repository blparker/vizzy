<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import { useData } from 'vitepress';
import { allSnippets } from '../../../snippets/index';

const { isDark } = useData();

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const errorEl = ref('');
const errorVisible = ref(false);
const selectedIndex = ref(0);
const currentTheme = computed<'dark' | 'light'>(() => isDark.value ? 'dark' : 'light');

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

    // GitHub themes to match Shiki code blocks
    const [githubDark, githubLight] = await Promise.all([
        import('../monaco-themes/github-dark.json'),
        import('../monaco-themes/github-light.json'),
    ]);
    monaco.editor.defineTheme('github-dark', (githubDark.default || githubDark) as any);
    monaco.editor.defineTheme('github-light', (githubLight.default || githubLight) as any);

    editor = monaco.editor.create(containerRef.value!, {
        value: '',
        language: 'typescript',
        theme: isDark.value ? 'github-dark' : 'github-light',
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

function onExampleChange(e: Event) {
    loadExample(Number((e.target as HTMLSelectElement).value));
}

onMounted(async () => {
    await nextTick();
    initMonaco();
});

watch(isDark, (dark) => {
    if (monacoModule) {
        monacoModule.editor.setTheme(dark ? 'github-dark' : 'github-light');
    }
    run();
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
            <button class="playground__btn playground__btn--run" @click="run">
                Run (⌘ Enter)
            </button>
        </div>
        <div class="playground__panels">
            <div class="playground__editor">
                <div ref="containerRef" class="playground__editor-inner" />
            </div>
            <div class="playground__canvas-panel">
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
}

.playground__toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: var(--vp-c-bg);
    border-bottom: 1px solid var(--vp-c-divider);
}

.playground__toolbar label {
    color: var(--vp-c-text-2);
    font-size: 13px;
}

.playground__toolbar select {
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-size: 13px;
}

.playground__spacer {
    flex: 1;
}

.playground__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 16px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
}

.playground__btn--run {
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}

.playground__btn--run:hover {
    background: var(--vp-c-brand-2);
    color: white;
}

.playground__btn--theme {
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
}

.playground__btn--theme:hover {
    color: var(--vp-c-text-1);
    border-color: var(--vp-c-text-2);
}

.playground__panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
}

.playground__editor {
    background: #1e1e1e;
    overflow: hidden;
    border-right: 1px solid var(--vp-c-divider);
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
    background: var(--vp-c-bg-soft);
    padding: 16px;
    gap: 8px;
}

.playground__canvas {
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    max-width: 100%;
    height: auto;
}

.playground__error {
    color: #e05050;
    background: rgba(224, 80, 80, 0.1);
    border: 1px solid rgba(224, 80, 80, 0.2);
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    max-width: 800px;
    width: 100%;
    white-space: pre-wrap;
}
</style>
