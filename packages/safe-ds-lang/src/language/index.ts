import { pipVersionRange } from './runtime/safe-ds-python-server.js';

// Services
export type { SafeDsServices } from './safe-ds-module.js';
export { createSafeDsServices } from './safe-ds-module.js';

// Language Server
export { startLanguageServer } from './main.js';

// Language Metadata
export { SafeDsLanguageMetaData } from './generated/module.js';

// AST
export * as ast from './generated/ast.js';
export * from './helpers/nodeProperties.js';

// Location
export { locationToString, positionToString, rangeToString } from '../helpers/locations.js';

// Messages
export * as messages from './runtime/messages.js';

// Commands
export * as commands from './communication/commands.js';

// RPC
export * as rpc from './communication/rpc.js';

// Generation
export { CODEGEN_PREFIX } from './generation/python/constants.js';

// Dependencies
export const dependencies = {
    'safe-ds-runner': {
        pipVersionRange,
    },
};
