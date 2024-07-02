import vscode, { ExtensionContext, Uri } from 'vscode';
import { SafeDsLanguageMetaData } from '../../../../safe-ds-lang/src/language/index.js';

export const dumpDiagnostics = (context: ExtensionContext) => async () => {
    // Get the current document
    const currentDocument = vscode.window.activeTextEditor?.document;
    if (!currentDocument) {
        vscode.window.showErrorMessage('No active document.');
        return;
    } else if (currentDocument.languageId !== SafeDsLanguageMetaData.languageId) {
        vscode.window.showErrorMessage('The active document is not a Safe-DS document.');
        return;
    }

    // Get diagnostics for the current document
    const diagnostics = vscode.languages.getDiagnostics(currentDocument.uri);
    if (diagnostics.length === 0) {
        vscode.window.showErrorMessage('The active document has no diagnostics.');
        return;
    }

    // Dump diagnostics to a file
    const machineId = vscode.env.machineId;
    const timestamp = new Date();
    const fileName = `${machineId}-${toBasicISOString(timestamp)}.json`;
    const uri = vscode.Uri.joinPath(diagnosticsDumpsUri(context), fileName);
    const content = JSON.stringify(
        {
            machineId,
            timestamp: timestamp.toISOString(),
            text: currentDocument.getText(),
            diagnostics,
        },
        null,
        2,
    );

    await vscode.workspace.fs.writeFile(uri, Buffer.from(content));

    // Inform the user and ask for further action
    const item = await vscode.window.showInformationMessage(`Diagnostics successfully dumped.`, 'Open file', 'Close');

    if (item === 'Open file') {
        vscode.window.showTextDocument(uri);
    }
};

export const diagnosticsDumpsUri = (context: ExtensionContext): Uri => {
    return vscode.Uri.joinPath(context.globalStorageUri, 'diagnosticsDumps');
};

const toBasicISOString = (date: Date): string => {
    return date.toISOString().replaceAll(/[-:]/gu, '');
};
