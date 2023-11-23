import * as defaultTypes from "./types";

// To extension
type ToExtensionCommand = "setGlobalState" | "setInfo" | "setError";

interface ToExtensionCommandMessage {
  command: ToExtensionCommand;
  value: any;
}
interface ToExtensionSetStateMessage extends ToExtensionCommandMessage {
  command: "setCurrentGloabalState";
  value: defaultTypes.State;
}

interface ToExtensionResetStateMessage extends ToExtensionCommandMessage {
  command: "resetGlobalState";
  value: null;
}

// Just example
interface ToExtensionSetInfoMessage extends ToExtensionCommandMessage {
  command: "setInfo";
  value: string;
}

interface ToExtensionSetErrorMessage extends ToExtensionCommandMessage {
  command: "setError";
  value: string;
}

export type ToExtensionMessage = ToExtensionSetInfoMessage | ToExtensionSetStateMessage | ToExtensionResetStateMessage | ToExtensionSetErrorMessage;

// From extension
type FromExtensionCommand = "setWebviewState";

interface FromExtensionCommandMessage {
  command: FromExtensionCommand;
  value: any;
}
interface FromExtensionSetStateMessage extends FromExtensionCommandMessage {
  command: "setWebviewState";
  value: defaultTypes.State[];
}

export type FromExtensionMessage = FromExtensionSetStateMessage;
