/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as os from 'os'
import * as path from 'path'
import { workspace, ExtensionContext } from 'vscode'

import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'

let client: LanguageClient

export const activate = (context: ExtensionContext) => {
    let launcher = os.platform() === 'win32' ? 'de.unibonn.simpleml.ide.bat' : 'de.unibonn.simpleml.ide';
    let script = context.asAbsolutePath(path.join('ls', 'bin', launcher));

    const serverOptions: ServerOptions = {
        run: {
            command: script,
            args: ['-log', 'debug', '--trace-deprecation'],
        },
        debug: {
            command: script,
            args: ['-log', 'debug', '--trace-deprecation'],
        },
    }

    // Options to control the language client
    let clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'simple-ml' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc'),
        },
        outputChannelName: 'Simple-ML Language Server',
    }

    // Create the language client and start the client.
    client = new LanguageClient('simpleml', 'Simple-ML', serverOptions, clientOptions)

    // Start the client. This will also launch the server
    client.start()
};

export const deactivate = (): Thenable<void> | undefined => {
    if (!client) {
        return undefined
    }
    return client.stop()
};
