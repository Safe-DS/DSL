import type { FromExtensionMessage } from "../../../types/shared-eda-vscode/messaging";
import type { State } from "../../../types/shared-eda-vscode/types";
import * as extensionApi from "./Apis/extensionApi";
import { writable } from "svelte/store";
import { GetJsonTable } from "./Apis/pythonApi";

// Define the stores, current state to default in case the extension never calls setWebviewState( Shouldn't happen)
let currentState = writable<State>({ tableIdentifier: window.tableIdentifier, randomText: "", defaultState: true });

// Set Global states whenever updatedAllStates changes
currentState.subscribe(($currentState) => {
  if(!$currentState.defaultState) extensionApi.setCurrentGlobalState($currentState);
});

// Find current state in allStates
const findAndSetStates = function(newAllStates: State[], tableIdentifier?: string): void {
  let foundState = newAllStates.find((as: State) => as.tableIdentifier === tableIdentifier);
  console.log(foundState ? "found state" : "no state found");

  if (foundState) {
    currentState.set(foundState);
  } else {
    GetJsonTable(window.tableIdentifier)
      .then((table) => {
        currentState.set({ tableIdentifier: window.tableIdentifier, randomText: "", table })
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
