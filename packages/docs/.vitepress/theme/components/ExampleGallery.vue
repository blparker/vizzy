<script setup lang="ts">
import { ref, computed } from 'vue';
import { snippetsByCategory } from '../../../snippets/index';
import type { Snippet } from '../../../snippets/types';
import ExampleCard from './ExampleCard.vue';

const props = defineProps<{
    category?: string;
}>();

const selected = ref<Snippet | null>(null);
const grouped = snippetsByCategory();

const items = computed(() => {
    if (props.category) return grouped[props.category] ?? [];
    return Object.values(grouped).flat();
});

function select(snippet: Snippet) {
    selected.value = snippet;
}

function back() {
    selected.value = null;
}
</script>

<template>
    <div class="example-gallery">
        <!-- Detail view -->
        <div v-if="selected" class="example-gallery__detail">
            <button class="example-gallery__back" @click="back">
                <span class="example-gallery__back-arrow">&larr;</span> Back to examples
            </button>
            <h3>{{ selected.title }}</h3>
            <p class="example-gallery__description">{{ selected.description }}</p>
            <VizzyExample :code="selected.code" :height="400" />
        </div>

        <!-- Grid view -->
        <div v-else class="example-gallery__grid">
            <ExampleCard
                v-for="snippet in items"
                :key="snippet.title"
                :snippet="snippet"
                @select="select"
            />
        </div>
    </div>
</template>

<style scoped>
.example-gallery__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 8px;
}

@media (max-width: 580px) {
    .example-gallery__grid {
        grid-template-columns: 1fr;
    }
}

.example-gallery__back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg);
    color: var(--vp-c-text-2);
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: 20px;
}

.example-gallery__back:hover {
    color: var(--vp-c-text-1);
    border-color: var(--vp-c-text-2);
}

.example-gallery__back-arrow {
    font-size: 16px;
}

.example-gallery__detail h3 {
    margin-top: 0;
}

.example-gallery__description {
    color: var(--vp-c-text-2);
    margin-bottom: 20px;
}
</style>
