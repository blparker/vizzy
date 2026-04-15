import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@vimath/core': resolve(__dirname, '../core/src/index.ts'),
            '@vimath/renderer-canvas': resolve(__dirname, '../renderer-canvas/src/index.ts'),
        },
    },
});
