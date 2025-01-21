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
    plugins: [
        svelte({
            emitCss: false,
        }),
    ],
    build: {
        rollupOptions: {
            input: '/src/main.ts',
            output: {
                entryFileNames: `graphical-editor.js`,
                dir: 'dist',
                preserveModules: false,
                inlineDynamicImports: true,
            },
            external: ['@safe-ds/lang'],
        },
        chunkSizeWarningLimit: 3000,
        //...unminifyExportedJs /* Uncomment this to get unmangled and readable js for debugging */,
    },
    resolve: {
        alias: {
            $: path.resolve('.'),
            $src: path.resolve('./src'),
            $assets: path.resolve('./src/assets'),
            $pages: path.resolve('./src/pages'),
            $global: path.resolve('../safe-ds-lang/src/language/graphical-editor/global.ts'),
        },
    },
});
