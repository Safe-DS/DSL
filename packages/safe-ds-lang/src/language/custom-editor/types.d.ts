import { GenericRequestHandler } from 'vscode-languageserver-protocol';

export type GenericRequestType = {
    method: string;
    handler: GenericRequestHandler;
};
