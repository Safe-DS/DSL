interface Message {
    command: string;
    value: any;
}

/*
 *  Extension to Webview
 */
interface ExtensionToWebviewTest extends Message {
    command: 'test';
    value: string;
}

interface ExtensionToWebviewUpdate extends Message {
    command: 'update';
    value: number;
}

export type ExtensionToWebview = ExtensionToWebviewTest | ExtensionToWebviewUpdate;

/*
 *  Webview to Extension
 */
interface WebviewToExtensionTest extends Message {
    command: 'test';
    value: string;
}

export type WebviewToExtension = WebviewToExtensionTest;
