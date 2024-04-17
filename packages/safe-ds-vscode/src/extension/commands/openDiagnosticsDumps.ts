import vscode, { ExtensionContext } from 'vscode';
import { diagnosticsDumpsUri } from './dumpDiagnostics.js';

export const openDiagnosticsDumps = (context: ExtensionContext) => async () => {
    const uri = diagnosticsDumpsUri(context);
    vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });
};
