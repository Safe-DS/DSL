import { get } from 'svelte/store';
import type { HistoryEntry } from '../../types/state';
import { table } from '../webviewState';

export const createInfoToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setInfo', value: message });
};

export const createErrorToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setError', value: message });
};

const executeRunnerExcludingHiddenColumns = function (
    pastEntries: HistoryEntry[],
    newEntry: HistoryEntry,
    hiddenColumns: string[],
) {
    window.injVscode.postMessage({
        command: 'executeRunner',
        value: { pastEntries, newEntry, hiddenColumns, type: 'excludingHiddenColumns' },
    });
};

const executeRunnerDefault = function (pastEntries: HistoryEntry[], newEntry: HistoryEntry) {
    window.injVscode.postMessage({
        command: 'executeRunner',
        value: { pastEntries, newEntry, type: 'default' },
    });
};

export const executeRunner = function (state: HistoryEntry[], entry: HistoryEntry) {
    if (entry.type === 'external-visualizing' && entry.columnNumber === 'none') {
        // This means a tab where you do not select columns => don't include hidden columns in visualization
        executeRunnerExcludingHiddenColumns(
            state,
            entry,
            get(table)
                ?.columns.filter((column) => column.hidden)
                .map((column) => column.name) ?? [],
        );
    } else {
        executeRunnerDefault(state, entry);
    }
};
