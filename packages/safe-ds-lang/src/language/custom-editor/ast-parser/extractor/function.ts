import { SdsFunction } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";
import { Parameter } from "./parameter.js";
import { Result } from "./result.js";

export class Function extends Declaration {
    public static override LOGGING_TAG = "CustomEditor] [AstParser] [Function";

    private constructor(
        name: string,
        public readonly isStatic: Boolean,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
    ) {
        super(name);
    }

    public static override default(): Function {
        return new Function("unknown", false, [], []);
    }

    public static override get(node: SdsFunction): Function {
        const parameterList =
            node.parameterList?.parameters.map(Parameter.get) ?? [];
        const resultList = node.resultList?.results.map(Result.get) ?? [];

        return new Function(
            node.name,
            node.isStatic,
            parameterList,
            resultList,
        );
    }
}
