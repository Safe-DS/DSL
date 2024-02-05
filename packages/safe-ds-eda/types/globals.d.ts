import type { ToExtensionMessage } from '../../../types/shared-eda-vscode/messaging.js';

declare global {
    interface Window {
        injVscode: {
            postMessage: (message: ToExtensionMessage) => void;
        };
        tableIdentifier: string;
    }
}
