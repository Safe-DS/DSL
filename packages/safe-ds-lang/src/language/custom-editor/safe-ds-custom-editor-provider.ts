import { Connection } from "vscode-languageserver";
import { SafeDsServices } from "../safe-ds-module.js";
import { GetAst } from "./getAst.js";
import { LangiumSharedServices } from "langium/lsp";
import { GetGlobalReferences } from "./getGlobalReferences.js";
import { GetNodeDesciption } from "./getNodeDescription.js";

export const addDiagramHandler = function (
    connection: Connection,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): void {
    connection.onRequest(
        GetAst.method,
        GetAst.handler(sharedServices, safeDsServices),
    );
    connection.onRequest(
        GetGlobalReferences.method,
        GetGlobalReferences.handler(sharedServices, safeDsServices),
    );
    connection.onRequest(
        GetNodeDesciption.method,
        GetNodeDesciption.handler(sharedServices, safeDsServices),
    );
};
