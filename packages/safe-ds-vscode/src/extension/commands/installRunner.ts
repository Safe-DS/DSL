import vscode, { ExtensionContext, Uri } from 'vscode';
import child_process from 'node:child_process';
import semver from 'semver';
import { dependencies } from '@safe-ds/lang';
import { logError } from '../output.js';
import fs from 'node:fs';

const pythonCommandCandidates = ['python3', 'python', 'py'];

const LOWEST_SUPPORTED_PYTHON_VERSION = '3.11.0';
const LOWEST_UNSUPPORTED_PYTHON_VERSION = '3.13.0';
const npmVersionRange = `>=${LOWEST_SUPPORTED_PYTHON_VERSION} <${LOWEST_UNSUPPORTED_PYTHON_VERSION}`;

export const installRunner = (context: ExtensionContext) => async () => {
    // Install the runner if it is not already installed
    if (!fs.existsSync(getRunnerCommand(context))) {
        const success = await doInstallRunner(context);
        if (!success) {
            return;
        }
    }

    // Set the runner command in the configuration
    await vscode.workspace
        .getConfiguration()
        .update('safe-ds.runner.command', getRunnerCommand(context), vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage('The runner has been installed successfully.');
};

/**
 * Installs the runner in a virtual environment. Returns true if the installation was successful.
 */
const doInstallRunner = async (context: ExtensionContext): Promise<boolean> => {
    // Check if a matching Python interpreter is available
    const pythonCommand = await getPythonCommand();
    if (!pythonCommand) {
        vscode.window.showErrorMessage('Could not find a matching Python interpreter.');
        logError('Could not find a matching Python interpreter.');
        return false;
    }

    // Create a virtual environment for the runner
    let success = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Window,
            title: 'Creating a virtual environment...',
        },
        async (progress) => {
            progress.report({ increment: 0 });
            try {
                await createRunnerVirtualEnvironment(context, pythonCommand);
            } catch (error) {
                vscode.window.showErrorMessage('Failed to create a virtual environment.');
                logError(String(error));
                return false;
            }
            progress.report({ increment: 100 });
            return true;
        },
    );
    if (!success) {
        return false;
    }

    // Install the runner in the virtual environment
    success = await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Window,
            title: 'Installing the runner (this may take a few minutes)...',
        },
        async (progress) => {
            progress.report({ increment: 0 });
            try {
                await installRunnerInVirtualEnvironment(context);
            } catch (error) {
                vscode.window.showErrorMessage('Failed to install the runner.');
                logError(String(error));
                return false;
            }
            progress.report({ increment: 100 });
            return true;
        },
    );
    return success;
};

const getPythonCommand = async (): Promise<string | undefined> => {
    for (const candidate of pythonCommandCandidates) {
        if (await isMatchingPython(candidate)) {
            return candidate;
        }
    }

    return undefined;
};

const isMatchingPython = async (pythonCommand: string): Promise<boolean> => {
    return new Promise((resolve) => {
        child_process.exec(
            `${pythonCommand} -c "import platform; print(platform.python_version())"`,
            (error, stdout) => {
                if (!error && semver.satisfies(stdout, npmVersionRange)) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            },
        );
    });
};

const createRunnerVirtualEnvironment = async (context: ExtensionContext, pythonCommand: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        child_process.exec(`${pythonCommand} -m venv ${runnerVirtualEnvironmentUri(context).fsPath}`, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

const installRunnerInVirtualEnvironment = async (context: ExtensionContext): Promise<void> => {
    return new Promise((resolve, reject) => {
        const installCommand = `${getPipCommand(context)} install "safe-ds-runner${dependencies['safe-ds-runner'].pipVersionRange}"`;
        child_process.exec(installCommand, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

const getPipCommand = (context: ExtensionContext): string => {
    if (process.platform === 'win32') {
        return `${runnerVirtualEnvironmentUri(context).fsPath}/Scripts/pip.exe`;
    } else {
        return `${runnerVirtualEnvironmentUri(context).fsPath}/bin/pip`;
    }
};

const getRunnerCommand = (context: ExtensionContext): string => {
    if (process.platform === 'win32') {
        return `${runnerVirtualEnvironmentUri(context).fsPath}/Scripts/safe-ds-runner.exe`;
    } else {
        return `${runnerVirtualEnvironmentUri(context).fsPath}/bin/safe-ds-runner`;
    }
};

const runnerVirtualEnvironmentUri = (context: ExtensionContext): Uri => {
    return vscode.Uri.joinPath(context.globalStorageUri, 'runnerVenv');
};
