import type { State } from '../../types/state';

export const setCurrentGlobalState = function (state: State) {
    window.injVscode.postMessage({
        command: 'setCurrentGlobalState',
        value: state,
    });
};

export const resetGlobalState = function () {
    window.injVscode.postMessage({
        command: 'resetGlobalState',
        value: null,
    });
};

export const createInfoToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setInfo', value: message });
};

export const createErrorToast = function (message: string) {
    window.injVscode.postMessage({ command: 'setError', value: message });
};
