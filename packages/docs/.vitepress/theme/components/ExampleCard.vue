<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { Snippet } from '../../../snippets/types';

const props = defineProps<{
    snippet: Snippet;
}>();

const emit = defineEmits<{
    select: [snippet: Snippet];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

async function renderPreview() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    try {
        const core = await import('@vizzyjs/core');
        const renderer = await import('@vizzyjs/renderer-canvas');

        const modules: Record<string, unknown> = { ...core, ...renderer };
        const moduleNames = Object.keys(modules);
        const moduleValues = Object.values(modules);

        let prepared = props.snippet.code.replace(/^\s*import\s+.*from\s+['"].*['"];?\s*$/gm, '');
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
        // silently fail for thumbnails
    }
}

onMounted(async () => {
    await nextTick();
    renderPreview();
});
</script>

<template>
    <div class="example-card" @click="emit('select', snippet)">
        <div class="example-card__preview">
            <canvas
                ref="canvasRef"
                :width="350"
                :height="200"
                class="example-card__canvas"
            />
        </div>
        <div class="example-card__info">
            <h3>{{ snippet.title }}</h3>
            <p>{{ snippet.description }}</p>
        </div>
    </div>
</template>

<style scoped>
.example-card {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.example-card:hover {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.example-card__preview {
    background: #171717;
    display: flex;
    justify-content: center;
    align-items: center;
}

.example-card__canvas {
    width: 100%;
    height: auto;
    display: block;
}

.example-card__info {
    padding: 12px 16px;
}

.example-card__info h3 {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
}

.example-card__info p {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
    line-height: 1.4;
}
</style>
