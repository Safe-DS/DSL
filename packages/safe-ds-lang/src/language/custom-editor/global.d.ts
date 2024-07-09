import { Placeholder } from "./ast-parse/placeholder.ts";
import { Call } from "./ast-parser/call.js";
import { GenericExpression } from "./ast-parser/expression.js";
import { Edge } from "./ast-parser/edge.js";
import { Uri } from "vscode";
import { CustomError } from "./ast-parser/utils.ts";

type Ast = {
    placeholderList: Placeholder[];
    callList: Call[];
    genericExpressionList: GenericExpression[];
    edgeList: Edge[];
};

export namespace AstInterface {
    export type Message = {
        uri: Uri;
    };
    export type Response =
        | { ast: string; errorList?: never }
        | { errorList: CustomError[]; ast?: never };
}
