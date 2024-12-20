import { SdsParameter } from "../../generated/ast.js";
import { Utils } from "./utils.js";

export class Parameter {
    private constructor(
        public readonly name: string,
        public readonly isConstant: boolean,
        public readonly type: string,
        public argumentText?: string,
        public readonly defaultValue?: string,
    ) {}

    public static parse(node: SdsParameter) {
        const name = node.name;
        const isConstant = node.isConstant;

        if (!node.type) return Utils.pushError("Undefined Type", node);
        const type =
            Utils.safeDsServices.typing.TypeComputer.computeType(
                node,
            ).toString();

        const defaultValue = node.defaultValue?.$cstNode?.text;

        return new Parameter(name, isConstant, type, undefined, defaultValue);
    }
}
