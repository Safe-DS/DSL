import { get } from 'svelte/store';
import type { FromExtensionMessage, RunnerExecutionResultMessage } from '../../types/messaging';
import type {
    EmptyTab,
    ExternalHistoryEntry,
    HistoryEntry,
    InteralEmptyTabHistoryEntry,
    InternalHistoryEntry,
    RealTab,
    Tab,
    TabHistoryEntry,
} from '../../types/state';
import { cancelTabIdsWaiting, tabs, history, currentTabIndex, table } from '../webviewState';
import { executeRunner } from './extensionApi';

// Wait for results to return from the server
const asyncQueue: (ExternalHistoryEntry & { id: number })[] = [];
let messagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
let entryIdCounter = 0;

export const getAndIncrementEntryId = function (): number {
    return entryIdCounter++;
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

        deployResult(message, asyncQueue[0]);
        asyncQueue.shift();
        evaluateMessagesWaitingForTurn();
    } else if (message.command === 'cancelRunnerExecution') {
        cancelExecuteExternalHistoryEntry(message.value);
    }
});

export const addInternalToHistory = function (entry: InternalHistoryEntry): void {
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
        };
        const newHistory = [...state, entryWithId];
        return newHistory;
    });

    updateTabOutdated(entry);
};

export const executeExternalHistoryEntry = function (entry: ExternalHistoryEntry): void {
    history.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: getAndIncrementEntryId(),
        };
        const newHistory = [...state, entryWithId];

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

    history.update((state) => {
        return [...state, entry];
    });
    tabs.update((state) => {
        const newTabs = (state ?? []).concat(tab);
        return newTabs;
    });
    currentTabIndex.set(get(tabs).indexOf(tab));
};

export const addEmptyTabHistoryEntry = function (): void {
    const entry: InteralEmptyTabHistoryEntry & { id: number } = {
        action: 'emptyTab',
        type: 'internal',
        alias: 'New empty tab',
        id: getAndIncrementEntryId(),
    };
    const tab: EmptyTab = {
        type: 'empty',
        id: crypto.randomUUID(),
        isInGeneration: true,
    };

    history.update((state) => {
        return [...state, entry];
    });
    tabs.update((state) => {
        const newTabs = (state ?? []).concat(tab);
        return newTabs;
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

const deployResult = function (result: RunnerExecutionResultMessage, historyEntry: ExternalHistoryEntry) {
    const resultContent = result.value;
    if (resultContent.type === 'tab') {
        if (resultContent.content.id) {
            const existingTab = get(tabs).find((et) => et.id === resultContent.content.id);
            if (existingTab) {
                const tabIndex = get(tabs).indexOf(existingTab);
                tabs.update((state) =>
                    state.map((t) => {
                        if (t.id === resultContent.content.id) {
                            return resultContent.content;
                        } else {
                            return t;
                        }
                    }),
                );
                currentTabIndex.set(tabIndex);
                return;
            }
        }
        const tab = resultContent.content;
        tab.id = crypto.randomUUID();
        tabs.update((state) => state.concat(tab));
        currentTabIndex.set(get(tabs).indexOf(tab));
    } else if (resultContent.type === 'table') {
        updateTabOutdated(historyEntry);
        throw new Error('Not implemented');
    }
};

const evaluateMessagesWaitingForTurn = function () {
    const newMessagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
    let firstItemQueueChanged = false;

    for (const entry of messagesWaitingForTurn) {
        if (asyncQueue[0].id === entry.value.historyId) {
            // eslint-disable-next-line no-console
            console.log(`Deploying message from waiting queue: ${entry}`);
            deployResult(entry, asyncQueue[0]);
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
                if (t.type !== 'empty' &&
                    t.columnNumber === 'none' &&
                    get(table)?.columns.find((c) => c.name === entry.columnName)?.type === 'numerical') {
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
