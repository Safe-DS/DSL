import { Disposable, DocumentState, URI } from "langium";
import { LangiumSharedServices } from "langium/lsp";
import {
    Connection,
    DidSaveTextDocumentParams,
    NotificationHandler,
} from "vscode-languageserver";
import { SafeDsServices } from "../safe-ds-module.js";
import { GenericRequestType } from "./types.js";
import { SyncChannelInterface } from "./global.js";
import { parseDocument } from "./ast-parser/main.js";

export const SYNC_TRIGGER_STATE: DocumentState = 6;
const openChannel = new Map<string, Disposable>();

const getSyncHandler = (
    message: SyncChannelInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
    connection: Connection,
): void => {
    const logger = safeDsServices.communication.MessagingProvider;

    if (message.action === "close") closeChannel(message);
    if (message.action === "open") {
        closeChannel(message);

        const syncHandlerSave: NotificationHandler<
            DidSaveTextDocumentParams
        > = async (params) => {
            logger.error("Sync", params.textDocument.uri);

            const document =
                await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
                    URI.parse(params.textDocument.uri),
                );
            await sharedServices.workspace.DocumentBuilder.build([document]);

            const [pipeline, errorList, segmentList] = parseDocument(document);

            const response: SyncChannelInterface.Response = {
                pipeline,
                errorList,
                segmentList,
            };
            connection.sendNotification(SyncChannelHandler.method, response);
        };

        const channelHandle = connection.onDidSaveTextDocument(syncHandlerSave);

        /*
        Man könnte über diese Methode ein Update des Graphen bei jedem Keystroke triggern.
        Dieses Verhalten speziell ist vermutlich zu viel, aber eine debouncte Version könnte 
        interessant sein.
        
        const syncHandler: DocumentBuildListener = () => {
            const response: SyncChannelInterface.Response = {
                test: "THIS is a sync event",
            };
            connection.sendNotification(SyncChannelHandler.method, response);
        };
        
        sharedServices.workspace.DocumentBuilder.onBuildPhase(
            SYNC_TRIGGER_STATE,
            syncHandler,
        );
        */

        openChannel.set(message.uri.toString(), channelHandle);
    }
};

const closeChannel = (message: SyncChannelInterface.Message) => {
    if (openChannel.has(message.uri.toString())) {
        const close = openChannel.get(message.uri.toString());
        if (close) close.dispose();
    }
};

export const SyncChannelHandler: GenericRequestType = {
    method: "custom-editor/sync-event",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
            conncetion: Connection,
        ) =>
        (message: SyncChannelInterface.Message) =>
            getSyncHandler(message, sharedServices, safeDsServices, conncetion),
};
