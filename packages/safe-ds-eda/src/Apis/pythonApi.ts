// // import type { Table } from "../../../../types/shared-eda-vscode/types";
// import type { PythonServerMessage } from "../../../safe-ds-vscode/src/extension/messages";

// export class PythonServerAPI {
//   private static instance: PythonServerAPI;
//   private pythonServerConnection: WebSocket | undefined;
//   private pythonServerAcceptsConnections: boolean = false;
//   private pythonServerMessageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> = new Map();
//   private initTableSet: boolean = false;

//   private constructor() {
//       this.connectToWebSocket().then(() => {
//           console.log("[PythonServerAPI] WebSocket connection established");
//       }).catch(err => {
//           console.error("[PythonServerAPI] Error establishing WebSocket connection:", err);
//       });
//   }

//   public static getInstance(): PythonServerAPI {
//       if (!PythonServerAPI.instance) {
//           PythonServerAPI.instance = new PythonServerAPI();
//       }
//       return PythonServerAPI.instance;
//   }

//   private async connectToWebSocket(): Promise<void> {
//       const timeoutMs = 200;
//       const maxConnectionTries = 5;
//       let currentTry = 0;

//       return new Promise<void>((resolve, reject) => {
//           const tryConnect = () => {
//               this.pythonServerConnection = new WebSocket(`ws://127.0.0.1:${window.pythonServerPort}/WSMain`);
//               console.log('[PythonServerAPI] Connecting to python server...');
              
//               this.pythonServerConnection.onopen = (event) => {
//                   this.pythonServerAcceptsConnections = true;
//                   console.log(`[PythonServerAPI] Now accepting connections: ${event.type}`);
//                   resolve();
//               };

//               this.pythonServerConnection.onerror = (event) => {
//                   currentTry += 1;
//                   console.log(event);
//                   if (currentTry > maxConnectionTries) {
//                       console.log('[PythonServerAPI] Max retries reached. No further attempt at connecting is made.');
//                       reject();
//                   } else {
//                       console.log('[PythonServerAPI] Server is not yet up. Retrying...');
//                       setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1));
//                   }

//                   // if (event.message.includes('ECONNREFUSED')) {
//                   //     if (currentTry > maxConnectionTries) {
//                   //         console.error('[Webview] Max retries reached. No further attempt at connecting is made.');
//                   //     } else {
//                   //         console.log(`[Webview] Server is not yet up. Retrying...`);
//                   //         setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
//                   //         return;
//                   //     }
//                   // }
//                   // console.error(`[Webview] An error occurred: ${event.message} (${event.type}) {${event.error}}`);
//               };

//               this.pythonServerConnection.onmessage = (event) => {
//                   if (typeof event.data !== 'string') {
//                       console.log(`[PythonServerAPI] Non-string message received: (${event.type}, ${typeof event.data})`);
//                       return;
//                   }
//                   console.log(`[PythonServerAPI] Message received: '${event.data}'`);
//                   const pythonServerMessage: PythonServerMessage = JSON.parse(event.data);
//                   if (!this.pythonServerMessageCallbacks.has(pythonServerMessage.type)) {
//                       console.log(`[PythonServerAPI] Unhandled message type '${pythonServerMessage.type}'`);
//                       return;
//                   }
//                   for (const callback of this.pythonServerMessageCallbacks.get(pythonServerMessage.type)!) {
//                       callback(pythonServerMessage);
//                   }
//               };

//               this.pythonServerConnection.onclose = (_event) => {
//                   this.pythonServerAcceptsConnections = false;
//                   console.log('[PythonServerAPI] Connection was unexpectedly closed');
//               };
//           };
//           tryConnect();
//       });
//   }

//   private sendMessageToPythonServer(message: PythonServerMessage): void {
//       if (!this.pythonServerConnection || !this.pythonServerAcceptsConnections) {
//           console.error('[PythonServerAPI] Cannot send message. No active connection.');
//           return;
//       }
//       const messageString = JSON.stringify(message);
//       console.log(`[PythonServerAPI] Sending message to python server: ${messageString}`);
//       this.pythonServerConnection.send(messageString);
//   }

//   private addMessageCallback<M extends PythonServerMessage['type']>(callback: (message: Extract<PythonServerMessage, { type: M }>) => void, messageType: M): void {
//       if (!this.pythonServerMessageCallbacks.has(messageType)) {
//           this.pythonServerMessageCallbacks.set(messageType, []);
//       }
//       this.pythonServerMessageCallbacks.get(messageType)!.push(callback as (message: PythonServerMessage) => void);
//   }

//   private removeMessageCallback<M extends PythonServerMessage['type']>(callback: (message: Extract<PythonServerMessage, { type: M }>) => void, messageType: M): void {
//       if (!this.pythonServerMessageCallbacks.has(messageType)) {
//           return;
//       }
//       this.pythonServerMessageCallbacks.set(
//           messageType,
//           this.pythonServerMessageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
//       );
//   }

//   private async delay(ms: number): Promise<void> {
//       return new Promise(resolve => {setTimeout(resolve, ms)});
//   }

//   public async GetJsonTable(tableIdentifier: string): Promise<void> {
//       while (!this.pythonServerConnection || !this.pythonServerAcceptsConnections || this.initTableSet) {
//           await this.delay(100);
//       }

//       console.log(`[PythonServerAPI] Preparing to get JSON table with identifier: ${tableIdentifier}`);

//       const callback = (message: PythonServerMessage) => {
//           if (message.type !== 'placeholder_value' || message.id !== window.startPipelineId) {
//               return;
//           }
//           console.log(`[PythonServerAPI] Received data: ${JSON.stringify(message.data)}`);
//           this.initTableSet = true;
//           this.removeMessageCallback(callback, 'placeholder_value')
//       };

//       this.addMessageCallback(callback, 'placeholder_value');
//       this.sendMessageToPythonServer({ type: 'placeholder_query', id: window.startPipelineId, data: tableIdentifier });
//   }
// }
