/// <reference types="svelte" />
//import type { ToExtensionMessage } from '../../types/shared-eda-vscode/messaging.js';

declare global {
    interface Window {
        injVscode: {
            postMessage: (message) => void; // (message: ToExtensionMessage) => void;
            // getState: () => State[];
            // setState: (state: State[]) => void;
        };
        tableIdentifier: string;
        pythonServerPort: number;
    }
}

declare module '*.svg' {
    const content: string;
    export default content;
}
