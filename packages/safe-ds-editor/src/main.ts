import App from './App.svelte';
import './global.css';
import MessageHandler from './messaging/messageHandler';

let targetElement = document.getElementById('root');

if (!targetElement) {
    targetElement = document.body;
}

const app = new App({
    target: targetElement,
});

MessageHandler.listenToMessages();
MessageHandler.sendMessageTest('Pinguine haben keine Knie, sagt main.ts');

export default app;
