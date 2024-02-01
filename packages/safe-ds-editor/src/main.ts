import App from './App.svelte';
import './tailwind.css';

let targetElement = document.getElementById('root');
if (!targetElement) {
    targetElement = document.body;
}

const app = new App({
    target: targetElement,
});

export default app;
