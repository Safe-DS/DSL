import { resolveRelativePathToBuiltinFile } from './fileFinder.js';
import { isSdsClass, SdsClass } from '../generated/ast.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';

const CORE_CLASSES_URI = resolveRelativePathToBuiltinFile('safeds/lang/coreClasses.sdsstub');

export class SafeDsClasses extends SafeDsModuleMembers<SdsClass> {
    /* c8 ignore start */
    get Any(): SdsClass | undefined {
        return this.getClass('Any');
    }

    /* c8 ignore stop */

    get Boolean(): SdsClass | undefined {
        return this.getClass('Boolean');
    }

    get Float(): SdsClass | undefined {
        return this.getClass('Float');
    }

    get Int(): SdsClass | undefined {
        return this.getClass('Int');
    }

    get Nothing(): SdsClass | undefined {
        return this.getClass('Nothing');
    }

    get String(): SdsClass | undefined {
        return this.getClass('String');
    }

    private getClass(name: string): SdsClass | undefined {
        return this.getModuleMember(CORE_CLASSES_URI, name, isSdsClass);
    }
}
