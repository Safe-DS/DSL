import * as _vscode from "vscode";
import type { State, ToExtensionMessage } from "../types/messaging";

declare global {
  interface Window {
    injVscode: {
      postMessage: (message: ToExtensionMessage) => void;
      // getState: () => State[];
      // setState: (state: State[]) => void;
    };
    tableIdentifier: string;
    pythonServerPort: number;
  }
}
