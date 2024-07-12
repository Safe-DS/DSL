import { Call } from "./ast-parser/call.js";
import { GenericExpression } from "./ast-parser/expression.js";
import { Edge } from "./ast-parser/edge.js";
import { Uri } from "vscode";
import { Placeholder } from "./ast-parser/placeholder.js";

export { Placeholder } from "./ast-parser/placeholder.js";
export { Call } from "./ast-parser/call.js";
export { GenericExpression } from "./ast-parser/expression.js";
export { Edge } from "./ast-parser/edge.js";

export class Ast {
    constructor(
        public readonly placeholderList: Placeholder[] = [],
        public readonly callList: Call[] = [],
        public readonly genericExpressionList: GenericExpression[] = [],
        public readonly edgeList: Edge[] = [],
    ) {}
}

export namespace AstInterface {
    export type Message = {
        uri: Uri;
    };
    export type Response = { ast: Ast; errorList: CustomError[] };
}

export class CustomError {
    constructor(
        public readonly action: "block" | "notify",
        public readonly message: string,
    ) {}
}

type Message = {
    command: string;
    value: any;
};

namespace NsExtensionToWebview {
    export type Test = Message & {
        command: "test";
        value: string;
    };

    export type SendAst = Message & {
        command: "SendAst";
        value: AstInterface.Response;
    };
}

export type ExtensionToWebview =
    | NsExtensionToWebview.Test
    | NsExtensionToWebview.SendAst;

namespace NsWebviewToExtension {
    export type Test = Message & {
        command: "test";
        value: string;
    };
    export type RequestAst = Message & {
        command: "RequestAst";
        value: string;
    };
}

export type WebviewToExtension =
    | NsWebviewToExtension.Test
    | NsWebviewToExtension.RequestAst;
