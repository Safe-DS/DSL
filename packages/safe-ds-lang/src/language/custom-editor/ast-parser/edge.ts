import { GenericExpression } from "./expression.js";
import { Parameter } from "./parameter.js";
import { Placeholder } from "./placeholder.js";
import { Result } from "./result.js";
import { Utils } from "./utils.js";

export class Edge {
    public constructor(
        public readonly from: Port,
        public readonly to: Port,
    ) {}

    public static create(from: Port, to: Port) {
        Utils.edgeList.push(new Edge(from, to));
    }
}

export class Port {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Port";

    private constructor(
        public readonly nodeId: number,
        public readonly portIdentifier: string,
    ) {}

    public static fromName = (nodeId: number, name: string): Port => {
        return new Port(nodeId, name);
    };

    public static fromPlaceholder = (placeholder: Placeholder): Port => {
        return new Port(-1, placeholder.name);
    };

    public static fromResult = (result: Result, nodeId: number): Port => {
        return new Port(nodeId, result.name);
    };

    public static fromParameter = (
        parameter: Parameter,
        nodeId: number,
    ): Port => {
        return new Port(nodeId, parameter.name);
    };

    public static fromGenericExpression(
        node: GenericExpression,
        input: boolean,
    ) {
        return new Port(node.id, input ? "input" : "output");
    }

    public static isPortList(object: any): object is Port[] {
        return (
            Array.isArray(object) &&
            object.every((element) => element instanceof Port)
        );
    }
}
