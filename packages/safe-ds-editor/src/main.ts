import '@xyflow/svelte/dist/style.css'; /* This is for svelte-flow and needs to be imported before tailwind.css */
import './tailwind.css';
import MessageHandler from './messaging/messageHandler';
import type { Ast } from '../../safe-ds-lang/src/language/custom-editor/global';
import App from '$pages/App.svelte';

const initApp = async () => {
    MessageHandler.initialize();
    MessageHandler.listenToMessages();
    const response = await MessageHandler.getAst();
    const errorList = Array.isArray(response) ? response : [];
    const ast = errorList.length === 0 ? (response as Ast) : undefined;

    let targetElement = document.body;
    const app = new App({
        target: targetElement,
        props: {
            errorList,
            ast,
        },
    });

    return app;
};

initApp().catch(console.error);

export default initApp;
