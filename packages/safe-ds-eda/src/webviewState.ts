import type { FromExtensionMessage } from '../../../types/shared-eda-vscode/messaging';
import type { State } from '../../../types/shared-eda-vscode/types';
import * as extensionApi from './Apis/extensionApi';
import { writable } from 'svelte/store';

let currentTabIndex = writable<number>(0);

let preventClicks = writable<boolean>(false);

// Define the stores, current state to default in case the extension never calls setWebviewState( Shouldn't happen)
let currentState = writable<State>({ tableIdentifier: window.tableIdentifier, history: [], defaultState: true });

// Set Global states whenever updatedAllStates changes
currentState.subscribe(($currentState) => {
    if (!$currentState.defaultState) {
        extensionApi.setCurrentGlobalState($currentState);
    }
});

window.addEventListener('message', (event) => {
    const message = event.data as FromExtensionMessage;
    console.log(Date.now() + ': ' + message.command + ' called');
    switch (message.command) {
        case 'setWebviewState':
            // This should be fired immediately whenever the panel is created or made visible again
            currentState.set(message.value);
            break;
    }
});

export { currentState, currentTabIndex, preventClicks };
