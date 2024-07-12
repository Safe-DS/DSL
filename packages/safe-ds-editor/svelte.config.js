import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
    preprocess: vitePreprocess({
        postcss: true,
    }),
};

export default config;
