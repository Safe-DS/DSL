declare global {
    interface Window {
        injVscode: {
            postMessage: (message) => void;
        };
    }
}

export {}; // otherwise this file is not treated as a module and ignored
