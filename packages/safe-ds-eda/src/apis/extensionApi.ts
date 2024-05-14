import { get } from 'svelte/store';
import type {
    ExternalManipulatingHistoryEntry,
    ExternalVisualizingHistoryEntry,
    HistoryEntry,
} from '../../types/state';
import { table } from '../webviewState';

export const createInfoToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setInfo', value: message });
};

export const createErrorToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setError', value: message });
};

const executeRunnerVisualizing = function (
    pastEntries: HistoryEntry[],
    newEntry: ExternalVisualizingHistoryEntry & { id: number },
    hiddenColumns: string[],
) {
    window.injVscode.postMessage({
        command: 'executeRunner',
        value: { pastEntries, newEntry, hiddenColumns, type: 'visualizing' },
    });
};

const executeRunnerManipulating = function (
    pastEntries: HistoryEntry[],
    newEntry: ExternalManipulatingHistoryEntry & { id: number },
) {
    window.injVscode.postMessage({
        command: 'executeRunner',
        value: { pastEntries, newEntry, type: 'manipulating' },
    });
};

export const executeRunner = function (state: HistoryEntry[], entry: HistoryEntry) {
    if (entry.type === 'external-visualizing') {
        executeRunnerVisualizing(
            state,
            entry,
            get(table)
                ?.columns.filter((column) => column.hidden)
                .map((column) => column.name) ?? [],
        );
    } else if (entry.type === 'external-manipulating') {
        executeRunnerManipulating(state, entry);
    }
};
