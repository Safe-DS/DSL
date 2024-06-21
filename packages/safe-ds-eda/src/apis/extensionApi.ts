import { get } from 'svelte/store';
import type { HistoryEntry } from '../../types/state';
import { table } from '../webviewState';
import type { ExecuteRunnerAllEntry } from '../../types/messaging';
import { filterHistoryOnlyInternal } from './historyApi';

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

export const executeRunnerAll = function (entries: HistoryEntry[], jumpedToHistoryId: number) {
    const currentEntries: HistoryEntry[] = [];
    const finalEntries: ExecuteRunnerAllEntry[] = entries.map((entry) => {
        currentEntries.push(entry);
        if (entry.type === 'external-visualizing' && entry.columnNumber === 'none') {
            // If the entry is a tab where you do not select columns => don't include hidden columns in visualization
            // Hidden columns calculated by filtering the history for not overriden hide column calls up to this point
            return {
                type: 'excludingHiddenColumns',
                entry,
                hiddenColumns: filterHistoryOnlyInternal(currentEntries).reduce<string[]>((acc, filteredEntry) => {
                    if (filteredEntry.action === 'hideColumn') {
                        acc.push(filteredEntry.columnName);
                    }
                    return acc;
                }, []),
            };
        } else {
            return { type: 'default', entry };
        }
    });
    window.injVscode.postMessage({
        command: 'executeRunnerAll',
        value: { entries: finalEntries, jumpedToHistoryId },
    });
};

export const executeRunnerAllFuture = function (
    futureEntries: HistoryEntry[],
    pastEntries: HistoryEntry[],
    jumpedToHistoryId: number,
) {
    const currentEntries: HistoryEntry[] = pastEntries;
    const finalFutureEntries: ExecuteRunnerAllEntry[] = futureEntries.map((entry) => {
        currentEntries.push(entry);
        if (entry.type === 'external-visualizing' && entry.columnNumber === 'none') {
            // If the entry is a tab where you do not select columns => don't include hidden columns in visualization
            // Hidden columns calculated by filtering the history for not overriden hide column calls up to this point
            return {
                type: 'excludingHiddenColumns',
                entry,
                hiddenColumns: filterHistoryOnlyInternal(currentEntries).reduce<string[]>((acc, filteredEntry) => {
                    if (filteredEntry.action === 'hideColumn') {
                        acc.push(filteredEntry.columnName);
                    }
                    return acc;
                }, []),
            };
        } else {
            return { type: 'default', entry };
        }
    });
    window.injVscode.postMessage({
        command: 'executeRunnerAllFuture',
        value: { futureEntries: finalFutureEntries, pastEntries, jumpedToHistoryId },
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
