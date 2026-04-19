import { defineConfig } from 'vitepress';
import { resolve } from 'path';

export default defineConfig({
    title: 'Vizzy',
    description: 'A TypeScript library for building interactive math visualizations in the browser',
    base: '/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'Examples', link: '/examples/' },
            { text: 'API', link: '/api/' },
            { text: 'Hub', link: 'https://hub.vizzyjs.dev' },
        ],
        sidebar: {
            '/guide/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Shapes', link: '/guide/shapes' },
                        { text: 'Animations', link: '/guide/animations' },
                        { text: 'Interactivity', link: '/guide/interactivity' },
                    ],
                },
            ],
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/blparker/vizzy' },
        ],
    },
    vite: {
        resolve: {
            alias: {
                '@vizzyjs/core': resolve(__dirname, '../../core/src/index.ts'),
                '@vizzyjs/renderer-canvas': resolve(__dirname, '../../renderer-canvas/src/index.ts'),
            },
        },
    },
});
