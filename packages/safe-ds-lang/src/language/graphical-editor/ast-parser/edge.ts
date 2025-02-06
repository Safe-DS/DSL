import { GenericExpression } from './expression.js';
import { Parameter } from './parameter.js';
import { Parser } from './parser.js';
import { Placeholder } from './placeholder.js';
import { Result } from './result.js';
import { SegmentGroupId } from './segment.js';

export class Edge {
    public constructor(
        public readonly from: Port,
        public readonly to: Port,
    ) {}

    public static create(from: Port, to: Port, parser: Parser) {
        parser.graph.edgeList.push(new Edge(from, to));
    }
}

export class Port {
    private constructor(
        public readonly nodeId: string,
        public readonly portIdentifier: string,
    ) {}

    public static fromName = (nodeId: number, name: string): Port => {
        return new Port(nodeId.toString(), name);
    };

    public static fromPlaceholder = (placeholder: Placeholder, input: boolean): Port => {
        return new Port(placeholder.name, input ? 'target' : 'source');
    };

    public static fromResult = (result: Result, nodeId: number): Port => {
        return new Port(nodeId.toString(), result.name);
    };

    public static fromParameter = (parameter: Parameter, nodeId: number): Port => {
        return new Port(nodeId.toString(), parameter.name);
    };

    public static fromGenericExpression(node: GenericExpression, input: boolean) {
        return new Port(node.id.toString(), input ? 'target' : 'source');
    }

    public static fromAssignee = (node: Placeholder | Result, input: boolean): Port => {
        if (node instanceof Placeholder) {
            return new Port(node.name, input ? 'target' : 'source');
        }
        return new Port(SegmentGroupId.toString(), node.name);
    };

    public static isPortList(object: any): object is Port[] {
        return Array.isArray(object) && object.every((element) => element instanceof Port);
    }
}
