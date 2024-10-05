import { DocumentBuildListener, DocumentState, LangiumDocument } from "langium";
import { LangiumSharedServices } from "langium/lsp";
import { CancellationToken, Connection } from "vscode-languageserver";
import { SafeDsServices } from "../safe-ds-module.js";
import { GenericRequestType } from "./types.js";
import { SyncChannelInterface } from "./global.js";
import { Disposable } from "langium";

export const SYNC_TRIGGER_STATE: DocumentState = 6;
const openChannel = new Map<string, Disposable>();

const getSyncHandler = (
    message: SyncChannelInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
    connection: Connection,
): void => {
    if (message.action === "close") closeChannel(message);
    if (message.action === "open") {
        closeChannel(message);

        const syncHandler: DocumentBuildListener = (
            built: LangiumDocument[],
            _: CancellationToken,
        ) => {
            const logger = safeDsServices.communication.MessagingProvider;
            // logger.warn("SYNC", JSON.stringify(built));
            const response: SyncChannelInterface.Response = {
                test: "THIS is a sync event",
            };
            connection.sendNotification(SyncChannelHandler.method, response);
        };

        const channelHandle =
            sharedServices.workspace.DocumentBuilder.onBuildPhase(
                SYNC_TRIGGER_STATE,
                syncHandler,
            );

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
