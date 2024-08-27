import { Call } from "./ast-parser/call.js";
import { GenericExpression } from "./ast-parser/expression.js";
import { Edge } from "./ast-parser/edge.js";
import { Uri } from "vscode";
import { Placeholder } from "./ast-parser/placeholder.js";

export { Placeholder } from "./ast-parser/placeholder.js";
export { Call } from "./ast-parser/call.js";
export { GenericExpression } from "./ast-parser/expression.js";
export { Edge } from "./ast-parser/edge.js";
export { Datatype } from "./ast-parser/type.js";

export class Ast {
    constructor(
        public readonly placeholderList: Placeholder[] = [],
        public readonly callList: Call[] = [],
        public readonly genericExpressionList: GenericExpression[] = [],
        public readonly edgeList: Edge[] = [],
    ) {}
}

export namespace AstInterface {
    export type Message = { uri: Uri };
    export type Response = { ast: Ast; errorList: CustomError[] };
}

export class GlobalReference {
    constructor(
        public readonly name: string,
        public readonly parent: string | undefined,
        public readonly category:
            | "DataImport"
            | "DataExport"
            | "DataProcessing"
            | "DataExploration"
            | "Modeling"
            | "ModelEvaluation"
            | (string & Record<never, never>),
    ) {}
}

export namespace GlobalReferenceInterface {
    export type Message = { uri: Uri };
    export type Response = { globalReferences: GlobalReference[] };
}

export namespace NodeDescriptionInterface {
    export type Message = { uri: Uri; uniquePath: string };
    export type Response = { description: string };
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

    export type SendGlobalReferences = Message & {
        command: "SendGlobalReferences";
        value: GlobalReferenceInterface.Response;
    };

    export type SendNodeDescription = Message & {
        command: "SendNodeDescription";
        value: NodeDescriptionInterface.Response;
    };
}

export type ExtensionToWebview =
    | NsExtensionToWebview.Test
    | NsExtensionToWebview.SendAst
    | NsExtensionToWebview.SendGlobalReferences
    | NsExtensionToWebview.SendNodeDescription;

namespace NsWebviewToExtension {
    export type Test = Message & {
        command: "test";
        value: string;
    };
    export type RequestAst = Message & {
        command: "RequestAst";
        value: string;
    };
    export type RequestGlobalReferences = Message & {
        command: "RequestGlobalReferences";
        value: string;
    };

    export type RequestNodeDescription = Message & {
        command: "RequestNodeDescription";
        value: string;
    };
}

export type WebviewToExtension =
    | NsWebviewToExtension.Test
    | NsWebviewToExtension.RequestAst
    | NsWebviewToExtension.RequestGlobalReferences
    | NsWebviewToExtension.RequestNodeDescription;
