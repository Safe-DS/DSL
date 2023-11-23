import type { FromExtensionMessage } from "../../../types/shared-eda-vscode/messaging";
import type { HistoryEntry, SerializableState, State } from "../../../types/shared-eda-vscode/types";
import * as extensionApi from "./Apis/extensionApi";
import { writable } from "svelte/store";
import { GetJsonTable } from "./Apis/pythonApi";

// Define the stores, current state to default in case the extension never calls setWebviewState( Shouldn't happen)
let currentState = writable<State>({ tableIdentifier: window.tableIdentifier, history: new Map<number, HistoryEntry>(), defaultState: true });

// Set Global states whenever updatedAllStates changes
currentState.subscribe(($currentState) => {
  if(!$currentState.defaultState) {
    // Make copy of state such that changing the its tabs property and it's .table.columns property doesn't change the currentState
    const stateCopy: any = { ...$currentState };
    if($currentState.table) {
      stateCopy.table = { ...$currentState.table };
      stateCopy.table.columns = Array.from($currentState.table.columns.entries());
    }
    stateCopy.tabs = Array.from($currentState.tabs?.entries() ?? []);
    const serializableState: SerializableState = stateCopy;
    extensionApi.setCurrentGlobalState(serializableState);
  }
});

// Find current state in allStates
const findAndSetStates = function(newAllStates: SerializableState[], tableIdentifier?: string): void {
  let foundState = newAllStates.find((as: SerializableState) => as.tableIdentifier === tableIdentifier);
  console.log(foundState ? "found state" : "no state found");

  if (foundState) {
    const foundStateCopy: any = { ...foundState };
    if(foundStateCopy.table) foundStateCopy.table.columns = new Map(foundState.table!.columns);
    foundStateCopy.tabs = new Map(foundState.tabs);
    const foundStateDeserialized: State = foundStateCopy;
    currentState.set(foundStateDeserialized);
  } else {
    GetJsonTable(window.tableIdentifier)
      .then((table) => {
        currentState.set({ tableIdentifier: window.tableIdentifier, table, history: new Map<number, HistoryEntry>() })
      })
      .catch((error) => {
        extensionApi.createErrorToast(error.message);
      });
  }
}

// This should be fired immediately whenever the panel is created or made visible again
window.addEventListener("message", (event) => {
  const message = event.data as FromExtensionMessage;
  console.log(message.command + " called")
  switch (message.command) {
    case "setWebviewState":
      findAndSetStates(message.value, window.tableIdentifier);
      break;
  }
});

export { currentState };
