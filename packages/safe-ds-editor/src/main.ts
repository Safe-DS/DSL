import App from './App.svelte';
import '@xyflow/svelte/dist/style.css'; /* This is for svelte-flow and needs to be imported before tailwind.css */
import './tailwind.css';
import MessageHandler from './messaging/messageHandler';

// MessageHandler.listenToMessages();
// const { ast, error } = await MessageHandler.getAst();

// let targetElement = document.body;
// const app = new App({
//     target: targetElement,
//     props: {
//         criticalError: error,
//         ast: ast ?? '',
//     },
// });

// export default app;

const initApp = async () => {
    MessageHandler.setVscode();
    MessageHandler.listenToMessages();
    MessageHandler.sendMessageTest('THIS IS A TEST MESSAGE');
    const { ast, error } = await MessageHandler.getAst();

    let targetElement = document.body;
    const app = new App({
        target: targetElement,
        props: {
            criticalError: error,
            ast: ast ?? '',
        },
    });

    return app;
};

initApp().catch(console.error);

export default initApp;
