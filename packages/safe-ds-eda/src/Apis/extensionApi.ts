import type { State } from "../../../../types/shared-eda-vscode/types";

export const setGlobalState = function(states: State[]) {
  window.injVscode.postMessage({
    command: "setGlobalState",
    value: states,
  });
}

export const createInfoToast = function(message: string) {
  window.injVscode.postMessage({ command: "setInfo", value: message });
}

export const createErrorToast = function(message: string) {
  window.injVscode.postMessage({ command: "setError", value: message });
}
