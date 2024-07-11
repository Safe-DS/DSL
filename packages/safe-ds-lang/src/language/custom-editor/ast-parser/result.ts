import { SdsResult } from "../../generated/ast.js";
import { CustomError } from "../global.js";
import { Datatype, Type } from "./type.js";
import { Utils } from "./utils.js";

export class Result {
    constructor(
        public readonly name: string,
        public readonly type: Datatype,
    ) {}

    public static parse(node: SdsResult) {
        const name = node.name;

        if (!node.type) return Utils.pushError("Undefined Type", node);
        const type = Type.parse(node.type);
        if (type instanceof CustomError) return type;

        return new Result(name, type);
    }
}
