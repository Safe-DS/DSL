import type { ToExtensionMessage } from './messaging.js';

declare global {
    interface Window {
        injVscode: {
            postMessage: (message: ToExtensionMessage) => void;
        };
        tableIdentifier: string;
    }
}
