import App from './App.svelte';
import '@xyflow/svelte/dist/style.css'; /* This is for svelte-flow and needs to be imported before tailwind.css */
import './tailwind.css';
import MessageHandler from './messaging/messageHandler';

let targetElement = document.body;

const app = new App({
    target: targetElement,
});

MessageHandler.listenToMessages();
MessageHandler.sendMessageTest('Lattensepp und Hänno, sagt main.ts');

export default app;
