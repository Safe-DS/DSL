import type { ToExtensionMessage } from '../../types/shared-eda-vscode/messaging.js';

declare global {
    interface Window {
        injVscode: {
            postMessage: (message: ToExtensionMessage) => void;
            // getState: () => State[];
            // setState: (state: State[]) => void;
        };
        tableIdentifier: string;
        startPipelineId: string;
        pythonServerPort: number;
    }
}
