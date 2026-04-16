<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { Snippet } from '../../../snippets/types';
import { runCode } from '../run-code';

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
    await runCode(canvas, props.snippet.code, 'dark');
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
