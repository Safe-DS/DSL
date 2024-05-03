import App from './App.svelte';
import '@xyflow/svelte/dist/style.css'; /* This is for svelte-flow and needs to be imported before tailwind.css */
import './tailwind.css';
import MessageHandler from './messaging/messageHandler';

const initApp = async () => {
    MessageHandler.setVscode();
    MessageHandler.listenToMessages();
    const { ast, errorList } = await MessageHandler.getAst();

    let targetElement = document.body;
    const app = new App({
        target: targetElement,
        props: {
            criticalErrorList: errorList,
            ast: ast ?? '',
        },
    });

    return app;
};

initApp().catch(console.error);

export default initApp;
