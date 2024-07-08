import { SdsFunction } from "../../../generated/ast.js";
import { Parameter } from "./parameter.js";
import { Result } from "./result.js";

export class FunctionDeclaration {
    public static LOGGING_TAG = "CustomEditor] [AstParser] [Function";

    private constructor(
        public readonly name: string,
        public readonly isStatic: Boolean,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
    ) {}

    public static default(): FunctionDeclaration {
        return new FunctionDeclaration("unknown", false, [], []);
    }

    public static get(node: SdsFunction): FunctionDeclaration {
        const parameterList =
            node.parameterList?.parameters.map(Parameter.get) ?? [];
        const resultList = node.resultList?.results.map(Result.get) ?? [];

        return new FunctionDeclaration(
            node.name,
            node.isStatic,
            parameterList,
            resultList,
        );
    }
}
