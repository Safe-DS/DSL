import { get } from 'svelte/store';
import type { FromExtensionMessage, RunnerExecutionResultMessage } from '../../types/messaging';
import type { ExternalHistoryEntry, HistoryEntry, InternalHistoryEntry, Tab, TabHistoryEntry } from '../../types/state';
import { currentState, currentTabIndex } from '../webviewState';
import { executeRunner } from './extensionApi';

// Wait for results to return from the server
const asyncQueue: (ExternalHistoryEntry & { id: number })[] = [];
let messagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
let entryIdCounter = 0;

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

        deployResult(message);
        asyncQueue.shift();
        evaluateMessagesWaitingForTurn();
    }
});

export const addInternalToHistory = function (entry: InternalHistoryEntry): void {
    currentState.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: entryIdCounter++,
        };
        const newHistory = [...state.history, entryWithId];
        return {
            ...state,
            history: newHistory,
        };
    });
};

export const executeExternalHistoryEntry = function (entry: ExternalHistoryEntry): void {
    // eslint-disable-next-line no-console
    console.log(`Executing external history entry: ${entry}`);
    currentState.update((state) => {
        const entryWithId: HistoryEntry = {
            ...entry,
            id: entryIdCounter++,
        };
        const newHistory = [...state.history, entryWithId];

        asyncQueue.push(entryWithId);
        executeRunner(newHistory); // Is this good in here? Otherwise risk of empty array idk

        return {
            ...state,
            history: newHistory,
        };
    });
};

export const addAndDeployTabHistoryEntry = function (entry: TabHistoryEntry & { id: number }, tab: Tab): void {
    // Search if already exists and is up to date
    const existingTab = get(currentState).tabs?.find(
        (et) => et.type === tab.type && et.tabComment === tab.tabComment && tab.type && !et.content.outdated,
    );
    if (existingTab) {
        currentTabIndex.set(get(currentState).tabs!.indexOf(existingTab));
        return;
    }

    currentState.update((state) => {
        const newHistory = [...state.history, entry];

        return {
            ...state,
            history: newHistory,
            tabs: (state.tabs ?? []).concat([tab]),
        };
    });
    currentTabIndex.set(get(currentState).tabs!.indexOf(tab));
};

export const cancelExecuteExternalHistoryEntry = function (id: number): void {
    const index = asyncQueue.findIndex((entry) => entry.id === id);
    if (index !== -1) {
        asyncQueue.splice(index, 1);
    } else {
        throw new Error('Entry already fully executed');
    }
};

const deployResult = function (result: RunnerExecutionResultMessage) {
    if (result.value.type === 'tab') {
        const tab = result.value.content;
        currentState.update((state) => {
            return {
                ...state,
                tabs: (state.tabs ?? []).concat(tab),
            };
        });
        currentTabIndex.set(get(currentState).tabs!.indexOf(tab));
    }
};

const evaluateMessagesWaitingForTurn = function () {
    const newMessagesWaitingForTurn: RunnerExecutionResultMessage[] = [];
    let firstItemQueueChanged = false;

    for (const entry of messagesWaitingForTurn) {
        if (asyncQueue[0].id === entry.value.historyId) {
            // eslint-disable-next-line no-console
            console.log(`Deploying message from waiting queue: ${entry}`);
            deployResult(entry);
            asyncQueue.shift();
            firstItemQueueChanged = true;
        } else if (asyncQueue.findIndex((queueEntry) => queueEntry.id === entry.value.historyId) !== -1) {
            newMessagesWaitingForTurn.push(entry); // Only those that still exist in asyncqueue and were not the first item still have to be waited for
        }
    }

    messagesWaitingForTurn = newMessagesWaitingForTurn;
    if (firstItemQueueChanged) evaluateMessagesWaitingForTurn(); // Only if first element was deployed we have to scan again, as this is only deployment condition
};
