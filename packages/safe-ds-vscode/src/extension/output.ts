import vscode, { LogLevel } from 'vscode';

let logOutputChannel: vscode.LogOutputChannel | undefined = undefined;

export const initializeLog = function () {
    logOutputChannel = vscode.window.createOutputChannel('Safe-DS', { log: true });
    logOutputChannel.show();
};

export const logOutput = function (value: string) {
    logOutputChannel!.info(value);
    console.log(value);
};

export const logError = function (value: string) {
    logOutputChannel!.error(value);
    console.error(value);
};

export const printOutputMessage = function (value: string) {
    logOutputChannel!.appendLine(value);
    logOutputChannel!.show();
};
