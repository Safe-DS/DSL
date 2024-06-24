/* eslint-disable no-console */
import { get, writable } from 'svelte/store';
import type { FromExtensionMessage, RunnerExecutionResultMessage } from '../../types/messaging';
import type {
    CategoricalFilter,
    EmptyTab,
    ExternalHistoryEntry,
    HistoryEntry,
    InteralEmptyTabHistoryEntry,
    InternalHistoryEntry,
    NumericalFilter,
    Profiling,
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
    rerender,
    initialTable,
    profilingOutdated,
} from '../webviewState';
import { executeRunner, executeRunnerAll, executeRunnerAllFuture } from './extensionApi';
import { doesEntryActionInvalidateProfiling, filterHistoryOnlyInternal } from '../filterHistory';

// Wait for results to return from the server
const asyncQueue: (ExternalHistoryEntry & { id: number })[] = [];
let messagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
let entryIdCounter = 0;
export let currentHistoryIndex = writable<number>(-1); // -1 = last entry, 0 = first entry
let relevantJumpedToHistoryId: number | undefined;
export let undoEntry = writable<HistoryEntry | undefined>(undefined);
export let redoEntry = writable<HistoryEntry | undefined>(undefined);
let jumpToTabOnHistoryChange: Tab | undefined | null = null; // If set to not null and a multipleRunnerExecutionResult message comes in, the last focused tab will be updated if it is still there

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
            return 'sortByColumn'; // Thus overriding previous sorts
        case 'filterColumn':
            return entry.columnName + '.' + entry.filter.type;
        case 'voidFilterColumn':
            return entry.columnName + '.' + entry.filterType; // Thus overriding previous filters
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
            // Only deploy if the last message is the one that was jumped to

            const results = message.value.results;
            const currentHistory = get(history);
            const historyMap = new Map(currentHistory.map((entry) => [entry.id, entry]));

            if (message.value.type === 'past') {
                restoreTableInitialState();
            } else {
                rerender();
            }

            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const entry = historyMap.get(result.historyId);
                if (!entry) throw new Error('Entry not found for result');
                if (entry.type === 'internal') throw new Error('Internal entry found for external result');
                deployResult(result, entry, false);
            }

            let relevantJumpedToIndex = -1;
            let relevantJumpedToEntry: HistoryEntry | undefined;
            for (let i = 0; i < currentHistory.length; i++) {
                if (currentHistory[i].id === relevantJumpedToHistoryId) {
                    relevantJumpedToIndex = i;
                    relevantJumpedToEntry = currentHistory[i];
                    break;
                }
            }

            // Redo all internal history things considering overrideIds
            redoInternalHistory(currentHistory.slice(0, relevantJumpedToIndex + 1));

            // Restore tab order for still existing tabs
            tabs.update((state) => {
                const newTabs = relevantJumpedToEntry!.tabOrder.map((tabOrderId) => {
                    const inState = state.find((t) => t.id === tabOrderId);
                    if (!inState) {
                        throw new Error('Tab from tab order not found in state');
                    }
                    return inState;
                });

                return newTabs;
            });

            // Set currentTabIndex
            let overridejumpToTabOnHistoryChange = false;
            if (jumpToTabOnHistoryChange !== null) {
                if (jumpToTabOnHistoryChange === undefined) {
                    currentTabIndex.set(undefined);
                } else {
                    const indexOfjumpToTabOnHistoryChange = get(tabs).findIndex(
                        (t) => t.id === jumpToTabOnHistoryChange!.id,
                    );
                    if (indexOfjumpToTabOnHistoryChange !== -1) {
                        currentTabIndex.set(indexOfjumpToTabOnHistoryChange);
                    } else {
                        overridejumpToTabOnHistoryChange = true;
                        // eslint-disable-next-line no-console
                        console.error('Last focused tab not found in tabs');
                    }
                }
            }
            if (jumpToTabOnHistoryChange === null || overridejumpToTabOnHistoryChange) {
                if (relevantJumpedToEntry!.type === 'internal') {
                    if (relevantJumpedToEntry!.action === 'emptyTab') {
                        currentTabIndex.set(get(tabs).findIndex((t) => t.id === relevantJumpedToEntry!.newTabId));
                    } else {
                        currentTabIndex.set(undefined);
                    }
                } else if (relevantJumpedToEntry!.type === 'external-visualizing') {
                    currentTabIndex.set(
                        get(tabs).findIndex(
                            (t) => t.id === (relevantJumpedToEntry!.existingTabId ?? relevantJumpedToEntry!.newTabId),
                        ),
                    );
                } else {
                    currentTabIndex.set(undefined);
                }
            }
            jumpToTabOnHistoryChange = null;
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

const getCurrentProfiling = function (): { columnName: string; profiling: Profiling | undefined }[] {
    return get(table)!.columns.map((column) => ({
        columnName: column.name,
        profiling: column.profiling,
    }));
};

export const addInternalToHistory = function (entry: Exclude<InternalHistoryEntry, InteralEmptyTabHistoryEntry>): void {
    overrideUndoneEntries();
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
            overrideId: generateOverrideId(entry),
            tabOrder: generateTabOrder(), // Based on that entry cannot be a new tab
            profilingState:
                state.length - 1 >= 0 && state[state.length - 1].profilingState === null ? null : getCurrentProfiling(),
        };
        const newHistory = [...state, entryWithId];
        currentHistoryIndex.set(newHistory.length - 1);
        return newHistory;
    });
};

export const executeExternalHistoryEntry = function (entry: ExternalHistoryEntry): void {
    // Set table to loading if loading takes longer than 500ms
    if (entry.type === 'external-manipulating')
        setTimeout(() => {
            if (asyncQueue.length > 0) {
                tableLoading.set(true);
            }
        }, 500);

    const tabOrder = generateTabOrder();
    if (entry.type === 'external-visualizing' && entry.newTabId) {
        tabOrder.push(entry.newTabId);
    }

    overrideUndoneEntries();
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
            overrideId: generateOverrideId(entry),
            loading: true,
            tabOrder,
            profilingState: doesEntryActionInvalidateProfiling(entry.action)
                ? null
                : state.length - 1 >= 0 && state[state.length - 1].profilingState === null
                  ? null
                  : getCurrentProfiling(),
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
        return [
            ...state,
            {
                ...entry,
                overrideId: generateOverrideId(entry),
                tabOrder,
                profilingState:
                    state.length - 1 >= 0 && state[state.length - 1].profilingState === null
                        ? null
                        : getCurrentProfiling(),
            },
        ];
    });
    currentTabIndex.set(get(tabs).indexOf(tab));
};

export const addEmptyTabHistoryEntry = function (): void {
    const tabId = crypto.randomUUID();
    const entry: InteralEmptyTabHistoryEntry & { id: number } = {
        action: 'emptyTab',
        type: 'internal',
        alias: 'New tab',
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
        return [
            ...state,
            {
                ...entry,
                overrideId: generateOverrideId(entry),
                tabOrder,
                profilingState:
                    state.length - 1 >= 0 && state[state.length - 1].profilingState === null
                        ? null
                        : getCurrentProfiling(),
            },
        ];
    });
    currentTabIndex.set(get(tabs).indexOf(tab));
};

export const cancelExecuteExternalHistoryEntry = function (entry: HistoryEntry, removeEntry = true): void {
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

        if (entry.loading && !removeEntry) {
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

        if (removeEntry) {
            history.update((state) => state.filter((e) => e.id !== entry.id));
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

//#region History navigation
//#region Redo
export const redoHistoryEntries = function (upToHistoryId: number): void {
    jumpToTabOnHistoryChange = null; // In redo we always want to jump to the tab of the last relevant entry

    const currentHistory = get(history);
    const lastRelevantEntry = currentHistory.find((entry) => entry.id === upToHistoryId);
    if (!lastRelevantEntry) throw new Error('Entry not found in history');
    const lastRelevantEntryIndex = currentHistory.indexOf(lastRelevantEntry);
    if (lastRelevantEntryIndex <= get(currentHistoryIndex)) return; // Do not redo if the entry is the or before the current index

    const previousIndex = get(currentHistoryIndex);
    currentHistoryIndex.set(lastRelevantEntryIndex);

    // If the entries since the previous index are only internal, we can just redo them
    if (
        currentHistory.slice(previousIndex + 1, lastRelevantEntryIndex + 1).every((entry) => entry.type === 'internal')
    ) {
        redoInternalHistory(currentHistory.slice(previousIndex + 1, lastRelevantEntryIndex + 1));

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

    // Set entry at lastRelevantEntryIndex to loading and all others to not loading
    history.update((state) => {
        const newHistory = state.map((entry, index) => {
            if (index === lastRelevantEntryIndex) {
                return {
                    ...entry,
                    loading: true,
                };
            } else {
                return {
                    ...entry,
                    loading: false,
                };
            }
        });

        return newHistory;
    });

    executeRunnerAllFuture(
        currentHistory.slice(previousIndex + 1, lastRelevantEntryIndex + 1),
        currentHistory.slice(0, previousIndex + 1),
        upToHistoryId,
    );
};

export const redoLastHistoryEntry = function (): void {
    const currentHistoryIndexValue = get(currentHistoryIndex);
    const currentHistory = get(history);
    if (currentHistoryIndexValue + 1 === currentHistory.length) {
        // Already at last entry
        return;
    }

    const nextEntry = currentHistory[currentHistoryIndexValue + 1];

    redoHistoryEntries(nextEntry.id);
};

export const getRedoEntry = function (): HistoryEntry | undefined {
    const currentHistoryIndexValue = get(currentHistoryIndex);
    const currentHistory = get(history);
    if (currentHistoryIndexValue + 1 === currentHistory.length) {
        return undefined;
    }

    return currentHistory[currentHistoryIndexValue + 1];
};
//#endregion
//#region Undo
export const undoHistoryEntries = function (upToHistoryId: number): void {
    const currentHistory = get(history);
    const lastRelevantEntry = currentHistory.find((entry) => entry.id === upToHistoryId);
    if (!lastRelevantEntry) throw new Error('Entry not found in history');
    const lastRelevantEntryIndex = currentHistory.indexOf(lastRelevantEntry);
    if (lastRelevantEntryIndex >= get(currentHistoryIndex)) return; // Do not undo if the entry is the or after the current index

    currentHistoryIndex.set(lastRelevantEntryIndex);

    // Try cancelling any asyncQueue entries that are not yet executed and after the last relevant entry
    for (let i = currentHistory.length - 1; i > lastRelevantEntryIndex; i--) {
        const entry = currentHistory[i];
        if (entry.type === 'internal') {
            continue;
        }
        if (entry.loading) {
            try {
                cancelExecuteExternalHistoryEntry(entry, false);
            } catch (error) {
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
                // eslint-disable-next-line no-console
                console.error('Could not cancel entry', error);
            }
        }
    }

    // If the entries until relevant entry are only internal, we can just redo them
    if (currentHistory.slice(0, lastRelevantEntryIndex + 1).every((entry) => entry.type === 'internal')) {
        restoreTableInitialState();
        redoInternalHistory(currentHistory.slice(0, lastRelevantEntryIndex + 1));

        if (jumpToTabOnHistoryChange === null) {
            if (lastRelevantEntry.action === 'emptyTab') {
                currentTabIndex.set(get(tabs).findIndex((t) => t.id === lastRelevantEntry.newTabId));
            } else {
                currentTabIndex.set(undefined);
            }
        }

        jumpToTabOnHistoryChange = null;
        return;
    }

    relevantJumpedToHistoryId = upToHistoryId;
    // Set table to loading if loading takes longer than 500ms
    setTimeout(() => {
        if (relevantJumpedToHistoryId) {
            tableLoading.set(true); // Warning: does not check if there are any actual manipulating entries, but this is only loading anyway
        }
    }, 500);

    // Set entry at lastRelevantEntryIndex to loading
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
        relevantJumpedToHistoryId = undefined;
        restoreTableInitialState();
        currentHistoryIndex.set(-1);
        currentTabIndex.set(undefined);
        return;
    }

    const beforeLastEntry = currentHistory[currentHistoryIndexValue - 1];
    const lastEntry = currentHistory[currentHistoryIndexValue];
    const currentTabIndexValue = get(currentTabIndex);
    const currentTab = currentTabIndexValue !== undefined ? get(tabs)[currentTabIndexValue] : undefined;

    // Do not change forcus if the undone action is in table or in a tab that still exists after undo
    if (lastEntry.type === 'external-manipulating') {
        jumpToTabOnHistoryChange = undefined;
    } else if (lastEntry.type === 'external-visualizing') {
        const tabId = lastEntry.existingTabId;
        if (tabId !== undefined) {
            jumpToTabOnHistoryChange = get(tabs).find((t) => t.id === tabId) ?? null;
        } else {
            if (currentTab?.id === lastEntry.newTabId) {
                jumpToTabOnHistoryChange = null;
            } else {
                jumpToTabOnHistoryChange = currentTab;
            } // If not existingTabId, it is a new tab and the current tab can only stay in focus if it is not that tab
        }
    } else {
        if (lastEntry.action === 'emptyTab') {
            if (currentTab?.id === lastEntry.newTabId) {
                jumpToTabOnHistoryChange = null;
            } else {
                jumpToTabOnHistoryChange = currentTab;
            } // Current tab can only stay in focus if it is not that new tab
        } else {
            jumpToTabOnHistoryChange = undefined;
        }
    }
    undoHistoryEntries(beforeLastEntry.id);
};

export const getUndoEntry = function (): HistoryEntry | undefined {
    const currentHistoryIndexValue = get(currentHistoryIndex);
    const currentHistory = get(history);
    if (currentHistoryIndexValue + 1 === 0) {
        return undefined;
    }

    return currentHistory[currentHistoryIndexValue];
};
//#endregion
//#endregion

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
                // This will happen if called from executeRunnerAll as we reset tabs before, they are re-sorted later so all good
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
                        if (existingColumn.appliedFilters.find((f) => f.type === historyEntry.filter.type)) {
                            newColumn.appliedFilters = [historyEntry.filter as NumericalFilter];
                        } else {
                            newColumn.appliedFilters = existingColumn.appliedFilters.concat([
                                historyEntry.filter as NumericalFilter,
                            ]);
                        }
                    } else if (existingColumn.type === 'categorical') {
                        if (existingColumn.appliedFilters.find((f) => f.type === historyEntry.filter.type)) {
                            newColumn.appliedFilters = [historyEntry.filter as CategoricalFilter];
                        } else {
                            newColumn.appliedFilters = existingColumn.appliedFilters.concat([
                                historyEntry.filter as CategoricalFilter,
                            ]);
                        }
                    }
                } else if (
                    (historyEntry.action !== 'filterColumn' && historyEntry.action !== 'voidFilterColumn') ||
                    newColumn.name !== historyEntry.columnName
                ) {
                    newColumn.appliedFilters = existingColumn.appliedFilters;
                }

                return newColumn;
            });

            return {
                ...state,
                columns: updatedColumns,
                totalRows: initialTable?.totalRows ?? 0,
                visibleRows:
                    updatedColumns.reduce((acc, column) => {
                        if (column.values.length > acc) return column.values.length;
                        return acc;
                    }, 0) ?? 0,
            };
        });

        if (updateFocusedTab) currentTabIndex.set(undefined);
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

const updateTabOutdated = function (): void {
    const currentHistory = get(history).slice(0, get(currentHistoryIndex) + 1);
    const currentTable = get(table);
    if (!currentTable) return;

    const relevantToggleColumnEntries = currentHistory
        .filter(
            (e) =>
                (e.action === 'hideColumn' || e.action === 'showColumn') &&
                currentTable.columns.find((c) => c.name === e.columnName)?.type === 'numerical',
        )
        .map((e) => {
            return { entry: e, index: currentHistory.indexOf(e) };
        });

    const relevantFilterColumnEntries = currentHistory
        .filter((e) => e.action === 'filterColumn' || e.action === 'voidFilterColumn')
        .map((e) => {
            return { entry: e, index: currentHistory.indexOf(e) };
        });

    const findLastTabUpdateIndex = function (tabId: string): number {
        let lastTabUpdateIndex = -1;
        for (let i = currentHistory.length - 1; i >= 0; i--) {
            const currentEntry = currentHistory[i];
            if (
                currentEntry.type === 'external-visualizing' &&
                (currentEntry.existingTabId ?? currentEntry.newTabId) === tabId
            ) {
                lastTabUpdateIndex = i;
                break;
            }
        }
        if (lastTabUpdateIndex === -1) {
            throw new Error('Tab not found in history');
        }
        return lastTabUpdateIndex;
    };

    tabs.update((state) => {
        const newTabs = state.map((t) => {
            let outdated = false;

            if (t.type !== 'empty' && t.columnNumber === 'none') {
                // Find out if one of the outdating entries was after the last time the tab was updated
                const lastTabUpdateIndex = findLastTabUpdateIndex(t.id);

                for (const entry of relevantToggleColumnEntries) {
                    if (entry.index > lastTabUpdateIndex) {
                        // UPDATE the if in case there are none column tabs that do not depend on numerical columns
                        outdated = true;
                    }
                }

                if (!outdated) {
                    for (const entryObj of relevantFilterColumnEntries) {
                        const entry = entryObj.entry;
                        if (entry.action === 'filterColumn' || entry.action === 'voidFilterColumn') {
                            if (currentTable.columns.find((c) => c.name === entry.columnName)?.type === 'numerical') {
                                if (entryObj.index > lastTabUpdateIndex) {
                                    outdated = true;
                                }
                            }
                        }
                    }
                }

                return {
                    ...t,
                    outdated,
                };
            } else if (t.type !== 'empty') {
                // Find out if one of the outdating entries was after the last time the tab was updated
                const lastTabUpdateIndex = findLastTabUpdateIndex(t.id);

                for (const entryObj of relevantFilterColumnEntries) {
                    const entry = entryObj.entry;
                    if (entry.action === 'filterColumn' || entry.action === 'voidFilterColumn') {
                        if (t.columnNumber === 'one') {
                            if (entry.columnName === t.content.columnName) {
                                if (entryObj.index > lastTabUpdateIndex) {
                                    outdated = true;
                                }
                            }
                        } else if (t.columnNumber === 'two') {
                            if (
                                entry.columnName === t.content.xAxisColumnName ||
                                entry.columnName === t.content.yAxisColumnName
                            ) {
                                if (entryObj.index > lastTabUpdateIndex) {
                                    outdated = true;
                                }
                            }
                        }
                    }
                }

                return {
                    ...t,
                    outdated,
                };
            } else {
                return t;
            }
        });

        return newTabs;
    });
};

const redoInternalHistory = function (historyEntries: HistoryEntry[]): void {
    const entries = filterHistoryOnlyInternal(historyEntries);

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

let stillWaitingToExecute = false; // Only one table update can be processed at a time
table.subscribe(async (_value) => {
    if (stillWaitingToExecute) return;
    stillWaitingToExecute = true;
    // Things can only get outdated when table updates, but have to wait for all history entries to be final, can still be canceled or not even entered yet
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            const checkConditions = () => {
                if (relevantJumpedToHistoryId === undefined && asyncQueue.length === 0) {
                    stillWaitingToExecute = false;
                    resolve();
                } else {
                    setTimeout(checkConditions, 100);
                }
            };
            checkConditions();
        }, 150); // Initial wait of 150ms, either waiting for external, thus checkConditions, or for internal thus initial wait to wait for history entry to be there
    });
    updateTabOutdated();
});

history.subscribe((_value) => {
    undoEntry.set(getUndoEntry());

    const currentHistoryEntry = get(history)[get(currentHistoryIndex)];
    if (currentHistoryEntry === undefined) return;

    if (currentHistoryEntry.profilingState === null) {
        profilingOutdated.set(true);
    } else {
        profilingOutdated.set(false);
    }
});

currentHistoryIndex.subscribe((_value) => {
    undoEntry.set(getUndoEntry());
    redoEntry.set(getRedoEntry());

    const currentHistoryEntry = get(history)[get(currentHistoryIndex)];
    if (currentHistoryEntry === undefined) return;

    if (currentHistoryEntry.profilingState === null) {
        profilingOutdated.set(true);
    } else {
        profilingOutdated.set(false);
    }
});
