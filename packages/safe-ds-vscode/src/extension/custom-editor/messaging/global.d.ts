import { Error } from '$editor/types/error.ts';
import { Uri } from 'vscode';

export namespace AstInterface {
    export type Message = {
        uri: Uri;
    };
    export type Response = { ast: string; errorList?: never } | { errorList: Error[]; ast?: never };
}
