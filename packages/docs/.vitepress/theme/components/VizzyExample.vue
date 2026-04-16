<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { withBase } from 'vitepress';
import { codeToHtml } from 'shiki';

const props = defineProps<{
    code: string;
    height?: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const error = ref('');
const canvasHeight = props.height ?? 300;
const canvasWidth = Math.round(canvasHeight * (14 / 8));
const showCode = ref(true);
const highlightedCode = ref('');

const playgroundUrl = computed(() => {
    const encoded = btoa(encodeURIComponent(props.code));
    return withBase(`/playground/#code=${encoded}`);
});

async function highlight() {
    highlightedCode.value = await codeToHtml(props.code.trim(), {
        lang: 'typescript',
        themes: {
            light: 'github-light',
            dark: 'github-dark',
        },
        defaultColor: false,
    });
}

async function run() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    error.value = '';

    // Reset canvas dimensions before re-run (renderer applies DPR scaling)
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = '';
    canvas.style.height = '';

    try {
        const core = await import('@vizzyjs/core');
        const renderer = await import('@vizzyjs/renderer-canvas');

        const modules: Record<string, unknown> = { ...core, ...renderer };
        const moduleNames = Object.keys(modules);
        const moduleValues = Object.values(modules);

        let prepared = props.code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');
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
        const result = fn(canvas, 'dark', ...moduleValues);
        if (result && typeof result.then === 'function') {
            await result;
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : String(e);
    }
}

onMounted(async () => {
    await nextTick();
    run();
    highlight();
});
</script>

<template>
    <div class="vizzy-example">
        <div class="vizzy-example__canvas-wrap">
            <canvas
                ref="canvasRef"
                :width="canvasWidth"
                :height="canvasHeight"
                class="vizzy-example__canvas"
            />
        </div>
        <div v-if="error" class="vizzy-example__error">{{ error }}</div>
        <div class="vizzy-example__toolbar">
            <button class="vizzy-example__btn vizzy-example__btn--run" @click="run">
                <span class="vizzy-example__btn-icon">&#9654;</span> Run
            </button>
            <button class="vizzy-example__btn" @click="showCode = !showCode">
                {{ showCode ? 'Hide Code' : 'Show Code' }}
            </button>
            <a class="vizzy-example__btn vizzy-example__btn--playground" :href="playgroundUrl" target="_blank">
                Open in Playground &nearr;
            </a>
        </div>
        <div v-if="showCode" class="vizzy-example__code" v-html="highlightedCode" />
    </div>
</template>

<style scoped>
.vizzy-example {
    margin: 16px 0;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
}

.vizzy-example__canvas-wrap {
    background: #171717;
    display: flex;
    justify-content: center;
    padding: 16px;
}

.vizzy-example__canvas {
    border-radius: 4px;
    max-width: 100%;
    height: auto;
}

.vizzy-example__error {
    color: #e05050;
    background: #2a1515;
    padding: 8px 12px;
    font-family: monospace;
    font-size: 12px;
}

.vizzy-example__toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid var(--vp-c-divider);
    border-bottom: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
}

.vizzy-example__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 14px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg);
    color: var(--vp-c-text-2);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.vizzy-example__btn:hover {
    color: var(--vp-c-text-1);
    border-color: var(--vp-c-text-2);
}

.vizzy-example__btn--run {
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}

.vizzy-example__btn--run:hover {
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}

.vizzy-example__btn-icon {
    font-size: 10px;
}

.vizzy-example__btn--playground {
    margin-left: auto;
    text-decoration: none;
}

.vizzy-example__code {
    margin: 0;
}

.vizzy-example__code :deep(pre) {
    margin: 0;
    border-radius: 0;
    padding: 16px;
    overflow-x: auto;
}

.vizzy-example__code :deep(.shiki) {
    background-color: var(--shiki-dark-bg) !important;
    color: var(--shiki-dark) !important;
}

.vizzy-example__code :deep(.shiki span) {
    color: var(--shiki-dark) !important;
}

:root:not(.dark) .vizzy-example__code :deep(.shiki) {
    background-color: var(--shiki-light-bg) !important;
    color: var(--shiki-light) !important;
}

:root:not(.dark) .vizzy-example__code :deep(.shiki span) {
    color: var(--shiki-light) !important;
}
</style>
