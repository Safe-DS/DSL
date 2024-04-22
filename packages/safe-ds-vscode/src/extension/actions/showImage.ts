import vscode, { ExtensionContext, Uri } from 'vscode';
import { rpc } from '@safe-ds/lang';

export const showImage = (context: ExtensionContext) => {
    return async ({ image }: rpc.ShowImageParams) => {
        // Write the image to a file
        const uri = imageUri(context);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(image.bytes, 'base64'));

        // Open the image in a preview editor
        vscode.commands.executeCommand('vscode.openWith', uri, 'imagePreview.previewEditor', {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true,
            preserveFocus: true,
        });
    };
};

const imageUri = (context: ExtensionContext): Uri => {
    const storageUri = context.storageUri ?? context.globalStorageUri;
    return vscode.Uri.joinPath(storageUri, 'results', 'image.png');
};
