import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@vizzyjs/core': resolve(__dirname, '../core/src/index.ts'),
            '@vizzyjs/renderer-canvas': resolve(__dirname, '../renderer-canvas/src/index.ts'),
        },
    },
});
