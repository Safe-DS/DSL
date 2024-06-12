import { SdsExpression, SdsParameter } from "../../../generated/ast.js";
import { parseExpression } from "../parser/expression.js";
import { Utils } from "../utils.js";
import { Datatype } from "./datatype.js";
import { Literal } from "./literal.js";

export class Parameter {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Parameter";

    private constructor(
        public readonly name: string,
        public readonly datatype: Datatype,
        public readonly defaultValue: Literal | undefined,
        public readonly isConstant: boolean,
    ) {}

    public static get(node: SdsParameter): Parameter {
        const name = node.name;
        const isConstant = node.isConstant;
        const defaultValue = getDefaultValue(node.defaultValue);

        // Qustion: Does a undefined type mean implicit type? How should this be handled?
        if (!node.type) {
            Utils.pushError(
                Parameter.LOGGING_TAG,
                `Undefined Type for Parameter <${name}>`,
            );
        }
        const datatype = node.type
            ? Datatype.get(node.type)
            : Datatype.default();

        return new Parameter(name, datatype, defaultValue, isConstant);
    }
}

const getDefaultValue = (
    defaultValue: SdsExpression | undefined,
): Literal | undefined => {
    if (!defaultValue) {
        return undefined;
    }

    const tmp = parseExpression(defaultValue);
    if (tmp instanceof Literal) {
        return tmp;
    }

    return Literal.default();
};
