export const testMessage = function (message: string) {
    window.injVscode.postMessage({ command: 'test', value: message });
};

// window.addEventListener('message', (event) => {
//     const message = event.data as FromExtensionMessage;
//     console.log(Date.now() + ': ' + message.command + ' called');
//     switch (message.command) {
//         case 'setWebviewState':
//             // This should be fired immediately whenever the panel is created or made visible again
//             currentState.set(message.value);
//             break;
//     }
// });
