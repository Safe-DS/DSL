import type {
    AstInterface,
    ExtensionToWebview,
    GlobalReferenceInterface,
    NodeDescriptionInterface,
    SyncChannelInterface,
    WebviewToExtension,
} from '$global';

export default class MessageHandler {
    public static vsocde: {
        postMessage: (message: any) => void;
    };

    public static initialize() {
        MessageHandler.vsocde = window.injVscode;

        const messageObject: WebviewToExtension = {
            command: 'ManageSyncChannel',
            value: 'open',
        };
        MessageHandler.vsocde.postMessage(messageObject);
    }

    public static listenToMessages() {
        window.addEventListener('message', (event) => {
            const message = event.data as ExtensionToWebview;
            switch (message.command) {
                case 'SendAst':
                case 'SendGlobalReferences':
                case 'SendNodeDescription':
                case 'SendSyncEvent':
                    // These message types are handled elsewhere
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
                if (message.command === 'SendAst') {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
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

    public static async getGlobalReferences(): Promise<GlobalReferenceInterface.Response> {
        const response = await new Promise<GlobalReferenceInterface.Response>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as ExtensionToWebview;
                if (message.command === 'SendGlobalReferences') {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
                }
            };

            window.addEventListener('message', responseHandler);
            const messageObject: WebviewToExtension = {
                command: 'RequestGlobalReferences',
                value: '',
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });

        return response;
    }

    public static async getNodeDescription(
        uniquePath: string,
    ): Promise<NodeDescriptionInterface.Response> {
        const response = await new Promise<NodeDescriptionInterface.Response>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as ExtensionToWebview;
                if (message.command === 'SendNodeDescription') {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
                }
            };

            window.addEventListener('message', responseHandler);
            const messageObject: WebviewToExtension = {
                command: 'RequestNodeDescription',
                value: uniquePath,
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });

        return response;
    }

    public static handleSyncEvent(
        handler: (elements: SyncChannelInterface.Response) => void,
    ): void {
        window.addEventListener('message', (event) => {
            const message = event.data as ExtensionToWebview;
            if (message.command === 'SendSyncEvent')
                handler(message.value as SyncChannelInterface.Response);
        });
    }
}
