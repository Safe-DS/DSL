import { SdsResult } from "../../../generated/ast.js";
import { Utils } from "../utils.js";
import { Datatype, getDatatype, defaultDatatype } from "./datatype.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Result";

export interface Result {
    $type: "result";
    name: string;
    datatype: Datatype;
}

export const getResult = (node: SdsResult): Result => {
    const name = node.name;

    // Qustion: Does a undefined type mean implicit type? How should this be handled?
    // -> Grammatik lässt mehr zu -> ist aber fehler
    if (!node.type) {
        Utils.pushError(LOGGING_TAG, `Undefined Type for Result <${name}>`);
    }
    const datatype = node.type ? getDatatype(node.type) : defaultDatatype;

    return { $type: "result", name, datatype };
};
