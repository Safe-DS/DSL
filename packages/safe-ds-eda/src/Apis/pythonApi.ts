// import type { Table } from "../../../../types/shared-eda-vscode/types";
import type { PythonServerMessage } from "../../../safe-ds-vscode/src/extension/messages";

let pythonServerAcceptsConnections: boolean = false;
let pythonServerConnection: WebSocket | undefined = undefined;
let pythonServerMessageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> =
    new Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]>();

let initTableSet = false;

const connectToWebSocket = async function (): Promise<void> {
  const timeoutMs = 200;
  const maxConnectionTries = 5;
  let currentTry = 0;
  // Attach WS
  return new Promise<void>((resolve, reject) => {
      const tryConnect = function () {
          pythonServerConnection = new WebSocket(`ws://127.0.0.1:${window.pythonServerPort}/WSMain`);
          pythonServerConnection.onopen = (event) => {
              pythonServerAcceptsConnections = true;
              console.log(`[Runner] Now accepting connections: ${event.type}`);
              resolve();
          };
          pythonServerConnection.onerror = (event) => {
              currentTry += 1;
              console.log(event)
              if (currentTry > maxConnectionTries) {
                console.error('[Runner] Max retries reached. No further attempt at connecting is made.');
            } else {
                console.log(`[Runner] Server is not yet up. Retrying...`);
                setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
                return;
            }
              // if (event.message.includes('ECONNREFUSED')) {
              //     if (currentTry > maxConnectionTries) {
              //         console.error('[Runner] Max retries reached. No further attempt at connecting is made.');
              //     } else {
              //         console.log(`[Runner] Server is not yet up. Retrying...`);
              //         setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
              //         return;
              //     }
              // }
              // console.error(`[Runner] An error occurred: ${event.message} (${event.type}) {${event.error}}`);
              reject();
          };
          pythonServerConnection.onmessage = (event) => {
              if (typeof event.data !== 'string') {
                  console.log(`[Runner] Message received: (${event.type}, ${typeof event.data}) ${event.data}`);
                  return;
              }
              console.log(`[Runner] Message received: '${event.data}'`);
              const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
              if (!pythonServerMessageCallbacks.has(pythonServerMessage.type)) {
                  console.log(`[Runner] Message type '${pythonServerMessage.type}' is not handled`);
                  return;
              }
              for (const callback of pythonServerMessageCallbacks.get(pythonServerMessage.type)!) {
                  callback(pythonServerMessage);
              }
          };
          pythonServerConnection.onclose = (_event) => {
              // The connection was interrupted
              pythonServerAcceptsConnections = false;
              console.error('[Runner] Connection was unexpectedly closed');
          };
      };
      tryConnect();
  });
};

const sendMessageToPythonServer = function (message: PythonServerMessage): void {
  const messageString = JSON.stringify(message);
  console.log(`Sending message to python server: ${messageString}`);
  pythonServerConnection!.send(messageString);
};

/**
 * Register a callback to execute when a message from the python server arrives.
 *
 * @param callback Callback to execute
 * @param messageType Message type to register the callback for.
 */
export const addMessageCallback = function <M extends PythonServerMessage['type']>(
  callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
  messageType: M,
): void {
  if (!pythonServerMessageCallbacks.has(messageType)) {
      pythonServerMessageCallbacks.set(messageType, []);
  }
  pythonServerMessageCallbacks.get(messageType)!.push(<(message: PythonServerMessage) => void>callback);
};

/**
* Remove a previously registered callback from being called when a message from the python server arrives.
*
* @param callback Callback to remove
* @param messageType Message type the callback was registered for.
*/
export const removeMessageCallback = function <M extends PythonServerMessage['type']>(
  callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
  messageType: M,
): void {
  if (!pythonServerMessageCallbacks.has(messageType)) {
      return;
  }
  pythonServerMessageCallbacks.set(
      messageType,
      pythonServerMessageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
  );
};

// export const GetJsonTable = async function(tableName: string): Promise<Table> {
//   try {
//     const response = await await fetch(
//       "http://127.0.0.1:" + window.pythonServerPort + "/TableAsJson?" + new URLSearchParams({ tableName }),
//       {
//         method: "GET",
//       },
//     );
//     const responseText = await response.text();
//     if (!response.ok) throw new Error(responseText);

//     let numRows = 0;
//     let table: Table = { name: tableName, columns: [], visibleRows: 0, totalRows: numRows, appliedFilters: [] };
//     let index = 0;
//     for (const column of Object.entries(JSON.parse(responseText))) {
//       console.log(Object.values(column[1] as string).length)
//       if (Object.values(column[1] as string).length > numRows) {
//           numRows = Object.values(column[1] as string).length;
//       }

//       table.columns.push([index++, {
//         name: column[0],
//         values: Object.values(column[1] as string),
//         hidden: false,
//         highlighted: false,
//         type: "categorical",
//         appliedSort: null,
//         appliedFilters: [],
//         profiling: { top: [], bottom: [] },
//       }]);
//     }
//     table.totalRows = numRows;
//     return table;
//   } catch (error) {
//     throw new Error(`Could not get Table "${tableName}"`);
//   }
// }

export const GetJsonTable = async function(tableIdentifier: string): Promise<void> {
  if(!pythonServerConnection || pythonServerAcceptsConnections || initTableSet) {
    await connectToWebSocket();
  }

  const callback = (message: PythonServerMessage) => {
    if (message.type !== 'placeholder_value' || message.id !== window.startPipelineId) {
      return;
    }
    console.log(message.data);
    initTableSet = true;
    removeMessageCallback(callback, 'placeholder_value');
  };
  addMessageCallback(callback, 'placeholder_value');

  sendMessageToPythonServer({ type: 'placeholder_query', id: window.startPipelineId, data: tableIdentifier})
}
