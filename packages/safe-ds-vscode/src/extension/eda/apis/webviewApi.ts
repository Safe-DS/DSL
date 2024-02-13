import { Webview } from 'vscode';
import { FromExtensionMessage } from '@safe-ds/eda/types/messaging.js';

// Wrapper to enforce typing
export const postMessage = function (webview: Webview, message: FromExtensionMessage) {
    webview.postMessage(message);
};
