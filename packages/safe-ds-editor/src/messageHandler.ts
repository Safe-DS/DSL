import {
    Buildin,
    type Collection,
    type ExtractResult,
    GraphicalEditorParseDocumentRequest,
    GraphicalEditorGetBuildinsRequest,
    GraphicalEditorOpenSyncChannelRequest,
    GraphicalEditorCloseSyncChannelRequest,
    GraphicalEditorGetDocumentationRequest,
    GraphicalEditorSyncEventNotification,
} from '$global';

const ParseDocument = GraphicalEditorParseDocumentRequest;
const GetBuildins = GraphicalEditorGetBuildinsRequest;
const OpenSyncChannel = GraphicalEditorOpenSyncChannelRequest;
const CloseSyncChannel = GraphicalEditorCloseSyncChannelRequest;
const GetDocumentation = GraphicalEditorGetDocumentationRequest;
const SyncEvent = GraphicalEditorSyncEventNotification;

export class MessageHandler {
    public static vsocde: {
        postMessage: (message: any) => void;
    };
    public static controller: AbortController;

    public static initialize() {
        MessageHandler.vsocde = window.injVscode;
        MessageHandler.controller = new AbortController();

        const messageObject = {
            command: OpenSyncChannel.method,
        };
        MessageHandler.vsocde.postMessage(messageObject);
    }

    public static removeMessageListeners() {
        MessageHandler.controller.abort();
    }

    public static listenToMessages() {
        window.addEventListener(
            'message',
            (event) => {
                const message = event.data as { command: string; value: string };
                if (message.command === 'test') {
                    // eslint-disable-next-line no-console
                    console.log(message.value);
                }
            },
            { signal: MessageHandler.controller.signal },
        );
    }

    public static sendTestMessage(message: string) {
        const messageObject = {
            command: 'test',
            value: message,
        };
        MessageHandler.vsocde.postMessage(messageObject);
    }

    public static async parseDocument(): Promise<ExtractResult<typeof ParseDocument.type>> {
        const controller = new AbortController();

        const response = await new Promise<ExtractResult<typeof ParseDocument.type>>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as { command: string; value: ExtractResult<typeof ParseDocument.type> };
                if (message.command === ParseDocument.method) {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
                }
            };

            window.addEventListener('message', responseHandler, { signal: controller.signal });
            const messageObject = {
                command: ParseDocument.method,
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });

        controller.abort();
        return response;
    }

    public static async getBuildins(): Promise<Buildin[]> {
        const controller = new AbortController();

        const response = await new Promise<Buildin[]>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as { command: string; value: Buildin[] };
                if (message.command === GetBuildins.method) {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
                }
            };

            window.addEventListener('message', responseHandler, { signal: controller.signal });
            const messageObject = {
                command: GetBuildins.method,
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });

        controller.abort();
        return response;
    }

    public static async getDocumentation(uniquePath: string): Promise<ExtractResult<typeof GetDocumentation.type>> {
        const controller = new AbortController();

        const response = await new Promise<ExtractResult<typeof GetDocumentation.type>>((resolve) => {
            const responseHandler = (event: any) => {
                const message = event.data as { command: string; value: ExtractResult<typeof GetDocumentation.type> };
                if (message.command === GetDocumentation.method) {
                    window.removeEventListener('message', responseHandler);
                    resolve(message.value);
                }
            };

            window.addEventListener('message', responseHandler, { signal: controller.signal });
            const messageObject: { command: string; value: string } = {
                command: GetDocumentation.method,
                value: uniquePath,
            };
            MessageHandler.vsocde.postMessage(messageObject);
        });

        controller.abort();
        return response;
    }

    public static handleSyncEvent(handler: (elements: Collection) => void): void {
        window.addEventListener(
            'message',
            (event) => {
                const message = event.data as { command: string; value: Collection };
                if (message.command === SyncEvent.method) handler(message.value);
            },
            { signal: MessageHandler.controller.signal },
        );
    }

    public static closeSyncChannel() {
        const messageObject = {
            command: CloseSyncChannel.method,
        };
        MessageHandler.vsocde.postMessage(messageObject);
    }
}
