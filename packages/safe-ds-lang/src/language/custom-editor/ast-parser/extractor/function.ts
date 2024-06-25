import { SdsFunction } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";
import { Parameter } from "./parameter.js";
import { Result } from "./result.js";

export class FunctionDeclaration extends Declaration {
    public static override LOGGING_TAG = "CustomEditor] [AstParser] [Function";

    private constructor(
        name: string,
        public readonly isStatic: Boolean,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        text?: string,
    ) {
        super(name, text);
    }

    public static override default(): FunctionDeclaration {
        return new FunctionDeclaration("unknown", false, [], []);
    }

    public static override get(node: SdsFunction): FunctionDeclaration {
        const parameterList =
            node.parameterList?.parameters.map(Parameter.get) ?? [];
        const resultList = node.resultList?.results.map(Result.get) ?? [];

        return new FunctionDeclaration(
            node.name,
            node.isStatic,
            parameterList,
            resultList,
            node.$cstNode?.text,
        );
    }
}
