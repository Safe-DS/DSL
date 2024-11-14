import { Call } from "./ast-parser/call.js";
import { GenericExpression } from "./ast-parser/expression.js";
import { Edge } from "./ast-parser/edge.js";
import { Uri } from "vscode";
import { Placeholder } from "./ast-parser/placeholder.js";
import { Segment } from "./ast-parser/segment.js";

export { SegmentGroupId } from "./ast-parser/segment.js";
export { Segment } from "./ast-parser/segment.js";
export { Placeholder } from "./ast-parser/placeholder.js";
export { Call } from "./ast-parser/call.js";
export { GenericExpression } from "./ast-parser/expression.js";
export { Edge } from "./ast-parser/edge.js";
export { Parameter } from "./ast-parser/parameter.js";
export { Result } from "./ast-parser/result.js";

export class Graph {
    constructor(
        public readonly type: "segment" | "pipeline",
        public readonly ast: Ast = new Ast(),
        public readonly uniquePath: string = "",
        public readonly name: string = "",
    ) {}
}

export class Ast {
    constructor(
        public readonly placeholderList: Placeholder[] = [],
        public readonly callList: Call[] = [],
        public readonly genericExpressionList: GenericExpression[] = [],
        public readonly edgeList: Edge[] = [],
    ) {}
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

export namespace AstInterface {
    export type Message = { uri: Uri };
    export type Response = {
        pipeline: Graph;
        errorList: CustomError[];
        segmentList: Segment[];
    };
}

export namespace GlobalReferenceInterface {
    export type Message = { uri: Uri };
    export type Response = { globalReferences: GlobalReference[] };
}

export namespace NodeDescriptionInterface {
    export type Message = { uri: Uri; uniquePath: string };
    export type Response = { description: string };
}

export namespace SyncChannelInterface {
    export type Message = { uri: Uri; action: "open" | "close" };
    export type Response = {
        pipeline: Graph;
        errorList: CustomError[];
        segmentList: Segment[];
    };
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

    export type SendSyncEvent = Message & {
        command: "SendSyncEvent";
        value: SyncChannelInterface.Response;
    };
}

export type ExtensionToWebview =
    | NsExtensionToWebview.Test
    | NsExtensionToWebview.SendAst
    | NsExtensionToWebview.SendGlobalReferences
    | NsExtensionToWebview.SendNodeDescription
    | NsExtensionToWebview.SendSyncEvent;

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

    export type ManageSyncChannel = Message & {
        command: "ManageSyncChannel";
        value: string;
    };
}

export type WebviewToExtension =
    | NsWebviewToExtension.Test
    | NsWebviewToExtension.RequestAst
    | NsWebviewToExtension.RequestGlobalReferences
    | NsWebviewToExtension.RequestNodeDescription
    | NsWebviewToExtension.ManageSyncChannel;