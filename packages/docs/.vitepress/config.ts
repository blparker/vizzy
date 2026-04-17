import { defineConfig } from 'vitepress';
import { resolve } from 'path';

export default defineConfig({
    title: 'Vizzy',
    description: 'A TypeScript math visualization library inspired by manim',
    base: '/',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'Examples', link: '/examples/' },
            { text: 'Playground', link: '/playground/' },
            { text: 'API', link: '/api/' },
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
