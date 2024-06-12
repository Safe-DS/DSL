import { Placeholder } from "./placeholder.js";
import { Result } from "./result.js";

export class Edge {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Edge";

    public constructor(
        public readonly from: Port,
        public readonly to: Port,
    ) {}
}

export class Port {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Port";

    private constructor(
        public readonly nodeId: number,
        public readonly portIdentifier: string,
    ) {}

    public static fromPlaceholder = (placeholder: Placeholder): Port => {
        return new Port(-1, placeholder.name);
    };

    public static fromResult = (result: Result, nodeId: number): Port => {
        return new Port(nodeId, result.name);
    };

    public static isPortList(object: any): object is Port[] {
        return (
            Array.isArray(object) &&
            object.every((element) => element instanceof Port)
        );
    }
}
