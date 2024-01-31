import { Webview } from 'vscode';
import { FromExtensionMessage } from '../../../../../types/shared-eda-vscode/messaging.js';

// Wrapper to enforce typing
export const postMessage = function (webview: Webview, message: FromExtensionMessage) {
    webview.postMessage(message);
};
