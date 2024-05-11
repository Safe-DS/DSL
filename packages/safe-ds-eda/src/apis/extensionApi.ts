import type { HistoryEntry } from '../../types/state';

export const createInfoToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setInfo', value: message });
};

export const createErrorToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setError', value: message });
};

export const executeRunner = function (pastEntries: HistoryEntry[], newEntry: HistoryEntry) {
    window.injVscode.postMessage({ command: 'executeRunner', value: { pastEntries, newEntry } });
};
