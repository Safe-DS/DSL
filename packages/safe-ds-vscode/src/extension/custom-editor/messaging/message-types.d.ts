interface Message {
    command: string;
    value: any;
}

namespace NsExtensionToWebview {
    export interface Test extends Message {
        command: 'test';
        value: string;
    }

    export interface Update extends Message {
        command: 'update';
        value: number;
    }
}

export type ExtensionToWebview = NsExtensionToWebview.Test | NsExtensionToWebview.Update;

namespace NsWebviewToExtension {
    export interface Test extends Message {
        command: 'test';
        value: string;
    }
}

export type WebviewToExtension = NsWebviewToExtension.Test;
