/*
 * This should act as the central hub for messages that are related to the Custom Editor
 *
 * In General, all types that are relevant should get defined in here, and get imported
 * in other places.
 */

import { AstInterface } from './getAst.js';

interface Message {
    command: string;
    value: any;
}

namespace NsExtensionToWebview {
    export interface Test extends Message {
        command: 'test';
        value: string;
    }

    export interface SendAst extends Message {
        command: 'SendAst';
        value: AstInterface.Response;
    }
}

export type ExtensionToWebview = NsExtensionToWebview.Test | NsExtensionToWebview.SendAst;

namespace NsWebviewToExtension {
    export interface Test extends Message {
        command: 'test';
        value: string;
    }
    export interface RequestAst extends Message {
        command: 'RequestAst';
        value: string;
    }
}

export type WebviewToExtension = NsWebviewToExtension.Test | NsWebviewToExtension.RequestAst;
