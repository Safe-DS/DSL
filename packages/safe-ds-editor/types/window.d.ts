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

export {}; // otherwise this file is not treated as a module and ignored for some reason
