import vscode, { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node.js';
import { rpc, SafeDsServices } from '@safe-ds/lang';
import fs from 'node:fs';
import path from 'node:path';
import { installRunner, installRunnerInVirtualEnvironment } from './installRunner.js';
import { platform } from 'node:os';
import { safeDsLogger } from '../helpers/logging.js';

export const updateRunner = (context: ExtensionContext, client: LanguageClient, services: SafeDsServices) => {
    return async () => {
        // If the runner is already started, do nothing
        if (services.runtime.Runner.isReady()) {
            vscode.window.showInformationMessage('The runner is already installed and running.');
            return;
        }

        // If the runner executable cannot be found at all, install it from scratch
        if (!fs.existsSync(await getRunnerCommand())) {
            await installRunner(context, client, services)();
            return;
        }

        // Update the runner if it is already installed
        const success = await doUpdateRunner();
        if (!success) {
            return;
        }

        // Start the runner (needed if the configuration did not change, so no event is fired)
        await client.sendNotification(rpc.StartRunnerNotification.type);

        // Inform the user
        vscode.window.showInformationMessage('The runner has been updated successfully.');
    };
};

const doUpdateRunner = async (): Promise<boolean> => {
    // Check if pip is available
    const pipCommand = await getPipCommand();
    if (!pipCommand) {
        vscode.window.showErrorMessage('Failed to find pip.');
        safeDsLogger.error('Failed to find pip.');
        return false;
    }

    // Install the runner in the virtual environment
    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Window,
            title: 'Installing the runner (this may take a few minutes)...',
        },
        async () => {
            try {
                await installRunnerInVirtualEnvironment(pipCommand);
                return true;
            } catch (error) {
                vscode.window.showErrorMessage('Failed to install the runner.');
                safeDsLogger.error(String(error));
                return false;
            }
        },
    );
};

const getRunnerCommand = async (): Promise<string> => {
    return vscode.workspace.getConfiguration('safe-ds.runner').get('command') ?? '';
};

const getPipCommand = async (): Promise<string | undefined> => {
    const runnerCommand = await getRunnerCommand();
    if (!runnerCommand) {
        return;
    }

    const runnerDir = path.dirname(runnerCommand);
    if (platform() === 'win32') {
        return path.join(runnerDir, 'pip.exe');
    } else {
        return path.join(runnerDir, 'pip');
    }
};
