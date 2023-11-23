import type { SerializableState } from "../../../../types/shared-eda-vscode/types";

export const setCurrentGlobalState = function(state: SerializableState) {
  window.injVscode.postMessage({
    command: "setCurrentGloabalState",
    value: state,
  });
}

export const resetGlobalState = function() {
  window.injVscode.postMessage({
    command: "resetGlobalState",
    value: null,
  });
}

export const createInfoToast = function(message: string) {
  window.injVscode.postMessage({ command: "setInfo", value: message });
}

export const createErrorToast = function(message: string) {
  window.injVscode.postMessage({ command: "setError", value: message });
}
