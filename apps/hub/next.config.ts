import type { NextConfig } from 'next';

const config: NextConfig = {
    transpilePackages: ['@vizzyjs/core', '@vizzyjs/react', '@vizzyjs/renderer-canvas'],
    serverExternalPackages: ['esbuild'],
    async headers() {
        return [
            {
                source: '/vizzy-runtime.js',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/vizzy-runtime.js.map',
                headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
            },
        ];
    },
};

export default config;
