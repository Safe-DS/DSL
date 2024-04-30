import { Error } from '$editor/types/error.d.ts';

export namespace AstInterface {
    export type Message = {
        uri: vscode.Uri;
    };
    export type Response = { ast: string; error?: never } | { error: Error; ast?: never };
}
