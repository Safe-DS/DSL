import { Disposable, Webview } from 'vscode';
import { ExtensionToWebview, WebviewToExtension } from './message-types.js';
import { logOutput } from '../../extension/output.js';

export class MessageHandler {
    private static instance: MessageHandler;
    private webview: Webview;
    private constructor(webview: Webview) {
        this.webview = webview;
    }

    public static getInstance(webview: Webview) {
        if (!MessageHandler.instance) {
            MessageHandler.instance = new MessageHandler(webview);
        }
        return MessageHandler.instance;
    }

    public listenToMessages(): Disposable {
        logOutput('Registered Message Listener');
        return this.webview.onDidReceiveMessage(async (message: WebviewToExtension) => {
            logOutput(`${Date.now()}: ${message.command} called`);

            switch (message.command) {
                case 'test':
                    logOutput(message.value);
                    break;
            }
        });
    }

    public sendMessageTest(message: string) {
        const messageObject: ExtensionToWebview = {
            command: 'test',
            value: message,
        };
        this.webview.postMessage(messageObject);
    }
}
