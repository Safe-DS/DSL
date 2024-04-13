import { pipVersionRange, RPC_RUNNER_INSTALL, RPC_RUNNER_START, RPC_RUNNER_STARTED } from './runner/safe-ds-runner.js';

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
export * as messages from './runner/messages.js';

// Remote procedure calls
export const rpc = {
    runnerInstall: RPC_RUNNER_INSTALL,
    runnerStart: RPC_RUNNER_START,
    runnerStarted: RPC_RUNNER_STARTED,
};

// Dependencies
export const dependencies = {
    'safe-ds-runner': {
        pipVersionRange,
    },
};
