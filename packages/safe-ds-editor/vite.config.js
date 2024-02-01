import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
    css: {},
    plugins: [
        svelte({
            emitCss: false,
        }),
    ],
    build: {
        rollupOptions: {
            input: '/src/main.ts',
            output: {
                entryFileNames: `main.js`,
            },
        },
    },
});
