import '@xyflow/svelte/dist/style.css'; /* This is for svelte-flow and needs to be imported before tailwind.css */
import '$src/tailwind.css';
import App from '$pages/App.svelte';

let targetElement = document.body;

const app = new App({
    target: targetElement,
});

// eslint-disable-next-line import/no-default-export
export default app;
