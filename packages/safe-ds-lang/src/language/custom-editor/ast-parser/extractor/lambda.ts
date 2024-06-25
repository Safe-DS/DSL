import { SdsLambda } from "../../../generated/ast.js";
import { Parameter } from "./parameter.js";

export class Lambda {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Lambda";

    private constructor(
        public readonly parameterList: Parameter[],
        private readonly text?: string,
    ) {}

    public static get(node: SdsLambda): Lambda {
        const parameterList =
            node.parameterList?.parameters.map(Parameter.get) ?? [];

        const text = node.$cstNode?.text;
        return new Lambda(parameterList, text);
    }

    public toString(): string {
        return this.text ?? "";
    }
}
