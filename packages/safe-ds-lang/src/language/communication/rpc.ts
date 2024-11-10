import { MessageDirection, NotificationType0, RequestType0 } from 'vscode-languageserver';
import { NotificationType } from 'vscode-languageserver-protocol';
import { UUID } from 'node:crypto';

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
