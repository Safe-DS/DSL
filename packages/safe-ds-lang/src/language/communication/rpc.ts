import { MessageDirection, NotificationType0, RequestType0 } from 'vscode-languageserver';
import { NotificationType } from 'vscode-languageserver-protocol';

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
