// Services
export type { SafeDsServices } from './safe-ds-module.js';
export { createSafeDsServices, createSafeDsServicesWithBuiltins } from './safe-ds-module.js';

// Language Server
export { startLanguageServer } from './main.js';

// Language Metadata
export { SafeDsLanguageMetaData } from './generated/module.js';

// AST
import * as generatedAst from './generated/ast.js';
import * as nodeProperties from './helpers/nodeProperties.js';

export const ast = { ...generatedAst, ...nodeProperties };

// Location
export { locationToString, positionToString, rangeToString } from '../helpers/locations.js';
