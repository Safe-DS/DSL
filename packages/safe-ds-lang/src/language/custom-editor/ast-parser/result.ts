import { SdsResult } from "../../generated/ast.js";
import { Utils } from "./utils.js";

export class Result {
    constructor(
        public readonly name: string,
        public type: string,
    ) {}

    public static parse(node: SdsResult) {
        const name = node.name;

        if (!node.type) return Utils.pushError("Undefined Type", node);
        const type =
            Utils.safeDsServices.typing.TypeComputer.computeType(
                node,
            ).toString();

        return new Result(name, type);
    }
}
