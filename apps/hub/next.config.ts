import type { NextConfig } from 'next';

const config: NextConfig = {
    transpilePackages: ['@vizzyjs/core', '@vizzyjs/react', '@vizzyjs/renderer-canvas'],
    serverExternalPackages: ['esbuild'],
};

export default config;
