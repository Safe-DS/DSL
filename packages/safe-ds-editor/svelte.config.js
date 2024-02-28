// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
// import { defineConfig } from 'vite';
// import { svelte } from '@sveltejs/vite-plugin-svelte';

// const config = defineConfig({
//     plugins: [
//         svelte({
//             preprocess: vitePreprocess({ postcss: true }),
//             compilerOptions: {
//                 accessibilityChecks: false,
//             },
//         }),
//     ],
// });

// export default config;

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
    preprocess: vitePreprocess({
        postcss: true,
    }),
};

export default config;
