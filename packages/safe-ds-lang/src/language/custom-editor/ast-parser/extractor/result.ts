import { SdsResult } from "../../../generated/ast.js";
import { Utils } from "../utils.js";
import { Datatype } from "./datatype.js";

export class Result {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Result";

    private constructor(
        public readonly name: string,
        public readonly datatype: Datatype,
    ) {}

    public static get(node: SdsResult): Result {
        const name = node.name;

        if (!node.type) {
            Utils.pushError(
                Result.LOGGING_TAG,
                `Undefined Type for Result <${name}>`,
            );
        }
        const datatype = node.type
            ? Datatype.get(node.type)
            : Datatype.default();

        return new Result(name, datatype);
    }
}
