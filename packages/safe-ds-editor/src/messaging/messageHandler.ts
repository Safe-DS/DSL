import type { AstInterface } from '$vscode/messaging/getAst';
import type {
    ExtensionToWebview,
    WebviewToExtension,
} from '$vscode/messaging/message-types';

export default class MessageHandler {
    public static vsocde: {
        postMessage: (message: any) => void;
    };

    public static setVscode() {
        MessageHandler.vsocde = window.injVscode;
    }

    public static listenToMessages() {
        window.addEventListener('message', (event) => {
            const message = event.data as ExtensionToWebview;
            switch (message.command) {
                case 'SendAst':
                    // This Message is handled somewhere else
                    break;
                case 'test':
                    console.log(message.value);
                    break;
            }
        });
    }

    public static sendMessageTest(message: string) {
        const messageObject: WebviewToExtension = {
            command: 'test',
            value: message,
        };

        MessageHandler.vsocde.postMessage(messageObject);
    }

    public static async getAst(): Promise<AstInterface.Response> {
        const response = await new Promise<AstInterface.Response>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as ExtensionToWebview;
                switch (message.command) {
                    case 'SendAst':
                        window.removeEventListener('message', responseHandler);
                        resolve(message.value);
                    default:
                        return;
                }
            };

            window.addEventListener('message', responseHandler);
            const messageObject: WebviewToExtension = {
                command: 'RequestAst',
                value: '',
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });
        return response;
    }
}
