import { URI } from 'langium';
import { listSafeDsFiles } from '../../helpers/resources.js';

/**
 * Lists all Safe-DS files in `src/resources/builtins`.
 *
 * @return URIs of all discovered files.
 */
export const listBuiltinFiles = (): URI[] => {
    return listSafeDsFiles('builtins');
};
