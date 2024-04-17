import type {
    ExtensionToWebview,
    WebviewToExtension,
} from '../../../safe-ds-vscode/src/extension/custom-editor/messaging/message-types';

export default class MessageHandler {
    public static listenToMessages() {
        window.addEventListener('message', (event) => {
            const message = event.data as ExtensionToWebview;

            console.log(Date.now() + ': ' + message.command + ' called');

            switch (message.command) {
                case 'update':
                    break;
                case 'test':
                    console.log(message.value);
                    break;
            }
        });
        console.log('Registered Message Listener');
    }

    public static sendMessageTest(message: string) {
        const messageObject: WebviewToExtension = {
            command: 'test',
            value: message,
        };
        window.injVscode.postMessage(messageObject);
    }
}
