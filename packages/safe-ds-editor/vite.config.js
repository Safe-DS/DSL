import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

const unminifyExportedJs = {
    minify: 'terser',
    terserOptions: {
        mangle: false,
        format: {
            beautify: true,
        },
        keep_fnames: true,
        keep_classnames: true,
    },
};

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
                entryFileNames: `custom-editor.js`,
            },
        },
        // ...unminifyExportedJs, /* Uncomment this to get unmangled and readable js for debugging */
    },
    resolve: {
        alias: {
            $lib: path.resolve('./src/lib'),
            src: path.resolve('./src'),
            types: path.resolve('./types'),
        },
    },
});