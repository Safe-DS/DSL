import { DocumentBuildListener, DocumentState, LangiumDocument } from "langium";
import { LangiumSharedServices } from "langium/lsp";
import { CancellationToken, Connection } from "vscode-languageserver";
import { SafeDsServices } from "../safe-ds-module.js";
import { GenericRequestType } from "./types.js";

export const SYNC_TRIGGER_STATE: DocumentState = 6;

const getSyncHandler = (
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
    connection: Connection,
): DocumentBuildListener => {
    const syncHandler: DocumentBuildListener = (
        built: LangiumDocument[],
        _: CancellationToken,
    ) => {
        connection.sendNotification(SyncEventHandler.method, "sfdasd");
    };

    return syncHandler;
};

export const SyncEventHandler: GenericRequestType = {
    method: "custom-editor/sync-event",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
            conncetion: Connection,
        ) =>
        () =>
            getSyncHandler(sharedServices, safeDsServices, conncetion),
};
