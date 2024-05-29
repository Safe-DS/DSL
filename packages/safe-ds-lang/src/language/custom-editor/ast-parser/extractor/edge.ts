import { Placeholder } from "./placeholder.js";
import { Result } from "./result.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Edge";

export interface Port {
    $type: "port";
    nodeId: number;
    portIdentifier: string;
}

export interface Edge {
    $type: "edge";
    from: Port;
    to: Port;
}

export const createEdge = (from: Port, to: Port): Edge => {
    return {
        $type: "edge",
        from,
        to,
    };
};

export const placeholderToPort = (placeholder: Placeholder): Port => {
    return {
        $type: "port",
        nodeId: -1,
        portIdentifier: placeholder.name,
    };
};

export const resultToPort = (result: Result, nodeId: number): Port => {
    return {
        $type: "port",
        nodeId,
        portIdentifier: result.name,
    };
};

export const isPort = (object: any): object is Port => {
    return (
        object &&
        typeof object === "object" &&
        typeof object.nodeId === "number" &&
        typeof object.portIdentifier === "string" &&
        object.$type === "port"
    );
};

export const isPortList = (object: any): object is Port[] => {
    return Array.isArray(object) && object.every(isPort);
};

export const isEdge = (object: any): object is Edge => {
    return (
        object &&
        typeof object === "object" &&
        isPort(object.from) &&
        isPort(object.to)
    );
};
