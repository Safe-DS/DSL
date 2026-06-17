import { MessageDirection, NotificationType0, RequestType0 } from 'vscode-languageserver';
import { NotificationType, RequestType } from 'vscode-languageserver-protocol';
import { UUID } from 'node:crypto';
import { Buildin, Collection } from '../graphical-editor/global.js';
import { Uri } from 'vscode';

export namespace InstallRunnerNotification {
    export const method = 'runner/install' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType0(method);
}

export namespace StartRunnerNotification {
    export const method = 'runner/start' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new NotificationType0(method);
}

export namespace RunnerStartedNotification {
    export const method = 'runner/started' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType<RunnerStartedParams>(method);
}

export interface RunnerStartedParams {
    /**
     * The port the runner is listening on.
     */
    port: number;
}

export namespace UpdateRunnerNotification {
    export const method = 'runner/update' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType0(method);
}

export namespace ExploreTableNotification {
    export const method = 'runner/exploreTable' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType<ExploreTableNotification>(method);
}

export interface ExploreTableNotification {
    /**
     * The ID of the pipeline execution.
     */
    pipelineExecutionId: UUID;

    /**
     * The URI of the pipeline document.
     */
    uri: string;

    /**
     * The name of the pipeline.
     */
    pipelineName: string;

    /**
     * The end offset of the pipeline node. This is used to add more code to the pipeline by the EDA tool.
     */
    pipelineNodeEndOffset: number;

    /**
     * The name of the placeholder containing the table.
     */
    placeholderName: string;
}

export namespace ShowImageNotification {
    export const method = 'runner/showImage' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType<ShowImageParams>(method);
}

export interface ShowImageParams {
    image: {
        /**
         * The format of the image.
         */
        format: 'png';

        /**
         * The Base64-encoded image.
         */
        bytes: string;
    };
}

export namespace IsRunnerReadyRequest {
    export const method = 'runner/isReady' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType0(method);
}

export namespace GraphicalEditorSyncEventNotification {
    export const method = 'graphical-editor/sync-event' as const;
    export const messageDirection = MessageDirection.serverToClient;
    export const type = new NotificationType<Collection>(method);
}

export namespace GraphicalEditorOpenSyncChannelRequest {
    export const method = 'graphical-editor/openSyncChannel' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType<Uri, void, void>(method);
}

export namespace GraphicalEditorCloseSyncChannelRequest {
    export const method = 'graphical-editor/closeSyncChannel' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType<Uri, void, void>(method);
}

export namespace GraphicalEditorGetDocumentationRequest {
    export const method = 'graphical-editor/getDocumentation' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType<{ uri: Uri; uniquePath: string }, string | undefined, void>(method);
}

export namespace GraphicalEditorGetBuildinsRequest {
    export const method = 'graphical-editor/getBuildins' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType<void, Buildin[], void>(method);
}

export namespace GraphicalEditorParseDocumentRequest {
    export const method = 'graphical-editor/parseDocument' as const;
    export const messageDirection = MessageDirection.clientToServer;
    export const type = new RequestType<Uri, Collection, void>(method);
}
