import { defineConfig } from 'vitepress';
import { resolve } from 'path';

const SITE_URL = 'https://vizzyjs.dev';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_TITLE = 'Vizzy';
const SITE_DESCRIPTION =
    'A TypeScript library for building interactive math visualizations in the browser';

export default defineConfig({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    base: '/',
    head: [
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:url', content: SITE_URL }],
        ['meta', { property: 'og:title', content: SITE_TITLE }],
        ['meta', { property: 'og:description', content: SITE_DESCRIPTION }],
        ['meta', { property: 'og:image', content: OG_IMAGE }],
        ['meta', { property: 'og:image:width', content: '1616' }],
        ['meta', { property: 'og:image:height', content: '924' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: SITE_TITLE }],
        ['meta', { name: 'twitter:description', content: SITE_DESCRIPTION }],
        ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ],
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
