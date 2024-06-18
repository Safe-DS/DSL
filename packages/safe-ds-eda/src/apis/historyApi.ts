import { get, writable } from 'svelte/store';
import type { FromExtensionMessage, RunnerExecutionResultMessage } from '../../types/messaging';
import type {
    CategoricalFilter,
    EmptyTab,
    ExternalHistoryEntry,
    FullInternalHistoryEntry,
    HistoryEntry,
    InteralEmptyTabHistoryEntry,
    InternalHistoryEntry,
    NumericalFilter,
    RealTab,
    Tab,
    TabHistoryEntry,
} from '../../types/state';
import {
    cancelTabIdsWaiting,
    tabs,
    history,
    currentTabIndex,
    table,
    tableLoading,
    savedColumnWidths,
    restoreTableInitialState,
} from '../webviewState';
import { executeRunner, executeRunnerAll } from './extensionApi';

// Wait for results to return from the server
const asyncQueue: (ExternalHistoryEntry & { id: number })[] = [];
let messagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
let entryIdCounter = 0;
export let currentHistoryIndex = writable<number>(-1); // -1 = last entry, 0 = first entry
let relevantJumpedToHistoryId: number | undefined;

export const getAndIncrementEntryId = function (): number {
    return entryIdCounter++;
};

const generateOverrideId = function (entry: ExternalHistoryEntry | InternalHistoryEntry): string {
    switch (entry.action) {
        case 'hideColumn':
        case 'showColumn':
            return entry.columnName + '.visibility';
        case 'resizeColumn':
        case 'highlightColumn':
            return entry.columnName + '.' + entry.action;
        case 'reorderColumns':
            return 'reorderColumns'; // As reorder action contains all columns order
        case 'sortByColumn':
            return entry.action; // Thus enforcing override sort
        case 'voidSortByColumn':
            return 'sortByColumn'; // This overriding previous sorts
        case 'filterColumn':
            return entry.columnName + entry.filter.type + '.' + entry.action;
        case 'linePlot':
        case 'scatterPlot':
        case 'histogram':
        case 'boxPlot':
        case 'infoPanel':
        case 'heatmap':
        case 'emptyTab':
            const tabId = entry.newTabId ?? entry.existingTabId;
            return 'visualizing.' + tabId;
        default:
            throw new Error('Unknown action type to generateOverrideId');
    }
};

window.addEventListener('message', (event) => {
    const message = event.data as FromExtensionMessage;

    if (message.command === 'runnerExecutionResult') {
        if (asyncQueue.length === 0) {
            throw new Error('No entries in asyncQueue');
        }
        const asyncQueueEntryIndex = asyncQueue.findIndex((entry) => entry.id === message.value.historyId);
        if (asyncQueueEntryIndex === -1) return;
        if (asyncQueueEntryIndex !== 0) {
            // eslint-disable-next-line no-console
            console.log('Message not in turn, waiting for turn');
            messagesWaitingForTurn.push(message);
            return;
        }

        deployResult(message.value, asyncQueue[0]);
        asyncQueue.shift();

        if (asyncQueue.length === 0) {
            tableLoading.set(false);
        }

        evaluateMessagesWaitingForTurn();
    } else if (message.command === 'cancelRunnerExecution') {
        cancelExecuteExternalHistoryEntry(message.value);
    } else if (message.command === 'multipleRunnerExecutionResult') {
        if (message.value.results.length === 0) return;
        if (relevantJumpedToHistoryId === message.value.jumpedToHistoryId) {
            const results = message.value.results;
            const currentHistory = get(history);
            restoreTableInitialState();

            // Only deploy if the last message is the one that was jumped to
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const entry = currentHistory.find((e) => e.id === result.historyId);
                if (!entry) throw new Error('Entry not found for result');
                if (entry.type === 'internal') throw new Error('Internal entry found for external result');
                deployResult(result, entry, false);
            }

            // Redo all internal history things considering overrideIds
            let relevantJumpedToIndex = -1;
            let relevantJumpedToEntry: HistoryEntry | undefined;
            for (let i = 0; i < currentHistory.length; i++) {
                if (currentHistory[i].id === relevantJumpedToHistoryId) {
                    relevantJumpedToIndex = i;
                    relevantJumpedToEntry = currentHistory[i];
                    break;
                }
            }

            redoInternalHistory(currentHistory.slice(0, relevantJumpedToIndex + 1));

            // Restore tab order for still existing tabs
            tabs.update((state) => {
                const newTabs = relevantJumpedToEntry!.tabOrder.map((tabOrderId) => {
                    const inState = state.find((t) => t.id === tabOrderId);
                    if (!inState) throw new Error('Tab from tab order not found in state');
                    return inState;
                });

                return newTabs;
            });

            // Set currentTabIndex
            if (relevantJumpedToEntry!.type === 'internal') {
                if (relevantJumpedToEntry!.action === 'emptyTab') {
                    currentTabIndex.set(get(tabs).findIndex((t) => t.id === relevantJumpedToEntry!.newTabId));
                } else {
                    currentTabIndex.set(undefined);
                }
            } else if (relevantJumpedToEntry!.type === 'external-visualizing') {
                currentTabIndex.set(
                    get(tabs).findIndex(
                        (t) => t.id === relevantJumpedToEntry!.existingTabId ?? relevantJumpedToEntry!.newTabId,
                    ),
                );
            } else {
                currentTabIndex.set(undefined);
            }
            relevantJumpedToHistoryId = undefined;
            tableLoading.set(false);
        }
    }
});

const overrideUndoneEntries = function (): void {
    if (get(currentHistoryIndex) <= get(history).length - 1) {
        // Remove all entries after currentHistoryIndex
        history.update((state) => state.slice(0, get(currentHistoryIndex) + 1));
    }
};

export const addInternalToHistory = function (entry: Exclude<InternalHistoryEntry, InteralEmptyTabHistoryEntry>): void {
    overrideUndoneEntries();
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
            overrideId: generateOverrideId(entry),
            tabOrder: generateTabOrder(), // Based on that entry cannot be a new tab
        };
        const newHistory = [...state, entryWithId];
        currentHistoryIndex.set(newHistory.length - 1);
        return newHistory;
    });

    updateTabOutdated(entry);
};

export const executeExternalHistoryEntry = function (entry: ExternalHistoryEntry): void {
    // Set table to loading if loading takes longer than 500ms
    if (entry.type === 'external-manipulating')
        setTimeout(() => {
            if (asyncQueue.length > 0) {
                tableLoading.set(true);
            }
        }, 500);

    overrideUndoneEntries();
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
            overrideId: generateOverrideId(entry),
            loading: true,
            tabOrder: generateTabOrder(), // Not including new entry, but have to update in deploy
        };
        const newHistory = [...state, entryWithId];
        currentHistoryIndex.set(newHistory.length - 1);

        asyncQueue.push(entryWithId);
        executeRunner(state, entryWithId);

        return newHistory;
    });
};

export const addAndDeployTabHistoryEntry = function (entry: TabHistoryEntry & { id: number }, tab: Tab): void {
    // Search if already exists and is up to date
    const existingTab = get(tabs).find(
        (et) =>
            et.type !== 'empty' &&
            et.type === tab.type &&
            et.tabComment === tab.tabComment &&
            tab.type &&
            !et.outdated &&
            !et.isInGeneration,
    );
    if (existingTab) {
        currentTabIndex.set(get(tabs).indexOf(existingTab));
        return;
    }

    overrideUndoneEntries();
    tabs.update((state) => {
        const newTabs = (state ?? []).concat(tab);
        return newTabs;
    });
    const tabOrder = generateTabOrder();
    history.update((state) => {
        currentHistoryIndex.set(state.length);
        return [...state, { ...entry, overrideId: generateOverrideId(entry), tabOrder }];
    });
    currentTabIndex.set(get(tabs).indexOf(tab));
};

export const addEmptyTabHistoryEntry = function (): void {
    const tabId = crypto.randomUUID();
    const entry: InteralEmptyTabHistoryEntry & { id: number } = {
        action: 'emptyTab',
        type: 'internal',
        alias: 'New empty tab',
        id: getAndIncrementEntryId(),
        newTabId: tabId,
    };
    const tab: EmptyTab = {
        type: 'empty',
        id: tabId,
        isInGeneration: true,
    };

    overrideUndoneEntries();
    tabs.update((state) => {
        const newTabs = (state ?? []).concat(tab);
        return newTabs;
    });
    const tabOrder = generateTabOrder();
    history.update((state) => {
        currentHistoryIndex.set(state.length);
        return [...state, { ...entry, overrideId: generateOverrideId(entry), tabOrder }];
    });
    currentTabIndex.set(get(tabs).indexOf(tab));
};

export const cancelExecuteExternalHistoryEntry = function (entry: HistoryEntry): void {
    const index = asyncQueue.findIndex((queueEntry) => queueEntry.id === entry.id);
    if (index !== -1) {
        asyncQueue.splice(index, 1);
        if (entry.type === 'external-visualizing' && entry.existingTabId) {
            cancelTabIdsWaiting.update((ids) => {
                return ids.concat([entry.existingTabId!]);
            });
            const tab: Tab = get(tabs).find((t) => t.id === entry.existingTabId)! as Tab;
            if (tab.type !== 'empty') {
                unsetTabAsGenerating(tab);
            }
        }

        if (asyncQueue.length === 0) {
            tableLoading.set(false);
        }
    } else {
        throw new Error('Entry already fully executed');
    }
};

export const setTabAsGenerating = function (tab: RealTab): void {
    tabs.update((state) => {
        const newTabs = state.map((t) => {
            if (t === tab) {
                return {
                    ...t,
                    isInGeneration: true,
                };
            } else {
                return t;
            }
        });

        return newTabs;
    });
};

export const undoHistoryEntries = function (upToHistoryId: number): void {
    const currentHistory = get(history);
    const lastRelevantEntry = currentHistory.find((entry) => entry.id === upToHistoryId)!;
    const lastRelevantEntryIndex = currentHistory.indexOf(lastRelevantEntry);

    currentHistoryIndex.set(lastRelevantEntryIndex);

    // Try cancelling any asyncQueue entries that are not yet executed and after the last relevant entry
    for (let i = currentHistory.length - 1; i > lastRelevantEntryIndex; i--) {
        const entry = currentHistory[i];
        if (entry.type === 'internal') {
            continue;
        }
        if (entry.loading) {
            try {
                cancelExecuteExternalHistoryEntry(entry);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Could not cancel entry', e);
            }
        }
    }

    // If the remaining entries are only internal, we can just redo them
    if (currentHistory.slice(0, lastRelevantEntryIndex + 1).every((entry) => entry.type === 'internal')) {
        restoreTableInitialState();
        redoInternalHistory(currentHistory.slice(0, lastRelevantEntryIndex + 1));

        if (lastRelevantEntry.action === 'emptyTab') {
            currentTabIndex.set(get(tabs).findIndex((t) => t.id === lastRelevantEntry.newTabId));
        } else {
            currentTabIndex.set(undefined);
        }

        return;
    }

    relevantJumpedToHistoryId = upToHistoryId;
    // Set table to loading if loading takes longer than 500ms
    setTimeout(() => {
        if (relevantJumpedToHistoryId) {
            tableLoading.set(true); // Warning: does not check if there are any actual manipulating entries, but this is only loading anyway
        }
    }, 500);

    // Set entry at lastRelevantEntryIndex to loading and decrease currentHistoryIndex
    history.update((state) => {
        const newHistory = state.map((entry, index) => {
            if (index === lastRelevantEntryIndex) {
                return {
                    ...entry,
                    loading: true,
                };
            } else {
                return entry;
            }
        });

        return newHistory;
    });

    executeRunnerAll(currentHistory.slice(0, lastRelevantEntryIndex + 1), upToHistoryId);
};

export const undoLastHistoryEntry = function (): void {
    const currentHistoryIndexValue = get(currentHistoryIndex);
    const currentHistory = get(history);
    if (currentHistoryIndexValue + 1 === 0) {
        return;
    }
    if (currentHistoryIndexValue + 1 === 1) {
        restoreTableInitialState();
        currentHistoryIndex.set(-1);
        currentTabIndex.set(undefined);
        return;
    }

    const beforeLastEntry = currentHistory[currentHistoryIndexValue - 1];
    undoHistoryEntries(beforeLastEntry.id);
};

export const unsetTabAsGenerating = function (tab: RealTab): void {
    tabs.update((state) => {
        const newTabs = state.map((t) => {
            if (t === tab) {
                return {
                    ...t,
                    isInGeneration: false,
                };
            } else {
                return t;
            }
        });

        return {
            ...state,
            tabs: newTabs,
        };
    });
};

const deployResult = function (
    resultContent: RunnerExecutionResultMessage['value'],
    historyEntry: ExternalHistoryEntry & { id: number },
    updateFocusedTab = true,
) {
    if (resultContent.type === 'tab') {
        if (historyEntry.type !== 'external-visualizing') throw new Error('Deploying tab from non-visualizing entry');
        if (historyEntry.existingTabId) {
            const existingTab = get(tabs).find((et) => et.id === historyEntry.existingTabId);
            if (existingTab) {
                const tabIndex = get(tabs).indexOf(existingTab);
                tabs.update((state) =>
                    state.map((t) => {
                        if (t.id === historyEntry.existingTabId) {
                            return resultContent.content;
                        } else {
                            return t;
                        }
                    }),
                );
                if (updateFocusedTab) currentTabIndex.set(tabIndex);
            } else {
                // eslint-disable-next-line no-console
                console.error('Existing tab not found in tabs');

                const tab = resultContent.content;
                tab.id = historyEntry.existingTabId;
                tabs.update((state) => state.concat(tab));
                if (updateFocusedTab) currentTabIndex.set(get(tabs).indexOf(tab));
            }
        } else {
            const tab = resultContent.content;
            tab.id = historyEntry.newTabId!; // Must exist if not existingTabId, not sure why ts does not pick up on it itself here
            tabs.update((state) => state.concat(tab));
            if (updateFocusedTab) currentTabIndex.set(get(tabs).indexOf(tab));
        }
    } else if (resultContent.type === 'table') {
        table.update((state) => {
            if (!state) {
                throw new Error('State is not defined!');
            }

            const updatedColumns = state.columns.map((existingColumn) => {
                const newColumn = resultContent.content.columns.find((c) => c.name === existingColumn.name);
                if (!newColumn) throw new Error(`Column ${existingColumn.name} not found in new content!`);

                // Update properties from the new column
                newColumn.profiling = existingColumn.profiling;
                newColumn.hidden = existingColumn.hidden;
                newColumn.highlighted = existingColumn.highlighted;

                if (historyEntry.action === 'sortByColumn' && newColumn.name === historyEntry.columnName) {
                    newColumn.appliedSort = historyEntry.sort;
                } else if (historyEntry.action !== 'sortByColumn' && historyEntry.action !== 'voidSortByColumn') {
                    newColumn.appliedSort = existingColumn.appliedSort;
                }

                if (historyEntry.action === 'filterColumn' && newColumn.name === historyEntry.columnName) {
                    if (existingColumn.type === 'numerical') {
                        newColumn.appliedFilters = existingColumn.appliedFilters.concat([
                            historyEntry.filter as NumericalFilter,
                        ]);
                    } else if (existingColumn.type === 'categorical') {
                        newColumn.appliedFilters = existingColumn.appliedFilters.concat([
                            historyEntry.filter as CategoricalFilter,
                        ]);
                    }
                } else if (historyEntry.action !== 'filterColumn') {
                    newColumn.appliedFilters = existingColumn.appliedFilters;
                }

                return newColumn;
            });

            return {
                ...state,
                columns: updatedColumns,
            };
        });

        if (updateFocusedTab) currentTabIndex.set(undefined);

        updateTabOutdated(historyEntry);
    }

    // Set loading to false
    if (historyEntry.loading) {
        history.update((state) => {
            return state.map((entry) => {
                if (entry.id === historyEntry.id) {
                    return {
                        ...entry,
                        loading: false,
                    };
                } else {
                    return entry;
                }
            });
        });
    }
};

const evaluateMessagesWaitingForTurn = function () {
    const newMessagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
    let firstItemQueueChanged = false;

    for (const entry of messagesWaitingForTurn) {
        if (asyncQueue[0].id === entry.value.historyId) {
            // eslint-disable-next-line no-console
            console.log(`Deploying message from waiting queue: ${entry}`);
            deployResult(entry.value, asyncQueue[0]);
            asyncQueue.shift();
            firstItemQueueChanged = true;
        } else if (asyncQueue.findIndex((queueEntry) => queueEntry.id === entry.value.historyId) !== -1) {
            newMessagesWaitingForTurn.push(entry); // Only those that still exist in asyncqueue and were not the first item still have to be waited for
        }
    }

    messagesWaitingForTurn = newMessagesWaitingForTurn;
    if (firstItemQueueChanged) evaluateMessagesWaitingForTurn(); // Only if first element was deployed we have to scan again, as this is only deployment condition
};

const updateTabOutdated = function (entry: ExternalHistoryEntry | InternalHistoryEntry): void {
    if (entry.action === 'hideColumn' || entry.action === 'showColumn') {
        tabs.update((state) => {
            const newTabs = state.map((t) => {
                if (
                    t.type !== 'empty' &&
                    t.columnNumber === 'none' &&
                    get(table)?.columns.find((c) => c.name === entry.columnName)?.type === 'numerical'
                ) {
                    // UPDATE the if in case there are none column tabs that do not depend on numerical columns
                    return {
                        ...t,
                        outdated: true,
                    };
                } else {
                    return t;
                }
            });

            return newTabs;
        });
    }
};

export const filterHistory = function (entries: HistoryEntry[]): FullInternalHistoryEntry[] {
    // Keep only the last occurrence of each unique overrideId
    const lastOccurrenceMap = new Map<string, number>();
    const filteredEntries: HistoryEntry[] = [];

    // Traverse from end to start to record the last occurrence of each unique overrideId
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (!lastOccurrenceMap.has(overrideId)) {
            lastOccurrenceMap.set(overrideId, i);
        }
    }

    // Traverse from start to end to build the final result with only the last occurrences
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]!;
        const overrideId = entry.overrideId;

        if (lastOccurrenceMap.get(overrideId) === i) {
            filteredEntries.push(entry);
        }
    }

    return filteredEntries.filter((entry) => entry.type === 'internal') as FullInternalHistoryEntry[];
};

const redoInternalHistory = function (historyEntries: HistoryEntry[]): void {
    const entries = filterHistory(historyEntries);

    for (const entry of entries) {
        switch (entry.action) {
            case 'hideColumn':
            case 'showColumn':
                table.update((state) => {
                    const newColumns = state!.columns.map((column) => {
                        if (column.name === entry.columnName) {
                            return {
                                ...column,
                                hidden: entry.action === 'hideColumn',
                            };
                        } else {
                            return column;
                        }
                    });

                    return {
                        ...state!,
                        columns: newColumns,
                    };
                });
                break;
            case 'resizeColumn':
                savedColumnWidths.update((state) => {
                    const newWidths = new Map(state);
                    newWidths.set(entry.columnName, entry.value);
                    return newWidths;
                });
                break;
            case 'reorderColumns':
                table.update((state) => {
                    // Create a map to quickly find columns by their name
                    const columnMap = new Map(state!.columns.map((column) => [column.name, column]));

                    const newColumns = entry.columnOrder.map((name) => columnMap.get(name)!);

                    return {
                        ...state!,
                        columns: newColumns,
                    };
                });
                break;
            case 'highlightColumn':
                throw new Error('Highlighting not implemented');
            case 'emptyTab':
                const tab: EmptyTab = {
                    type: 'empty',
                    id: entry.newTabId,
                    isInGeneration: true,
                };
                tabs.update((state) => {
                    const newTabs = (state ?? []).concat(tab);
                    return newTabs;
                });
                break;
        }

        if (entry.loading) {
            history.update((state) => {
                return state.map((e) => {
                    if (e.id === entry.id) {
                        return {
                            ...e,
                            loading: false,
                        };
                    } else {
                        return e;
                    }
                });
            });
        }
    }
};

const generateTabOrder = function (): string[] {
    const tabOrder = get(tabs).map((tab) => tab.id);
    return tabOrder;
};
