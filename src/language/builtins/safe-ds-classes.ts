import { isSdsClass, SdsClass } from '../generated/ast.js';
import { SafeDsModuleMembers } from './safe-ds-module-members.js';
import { resourceNameToUri } from '../../helpers/resources.js';

const CORE_CLASSES_URI = resourceNameToUri('builtins/safeds/lang/coreClasses.sdsstub');

export class SafeDsClasses extends SafeDsModuleMembers<SdsClass> {
    get Any(): SdsClass | undefined {
        return this.getClass('Any');
    }

    get Boolean(): SdsClass | undefined {
        return this.getClass('Boolean');
    }

    get Float(): SdsClass | undefined {
        return this.getClass('Float');
    }

    get Int(): SdsClass | undefined {
        return this.getClass('Int');
    }

    get List(): SdsClass | undefined {
        return this.getClass('List');
    }

    get Map(): SdsClass | undefined {
        return this.getClass('Map');
    }

    get Nothing(): SdsClass | undefined {
        return this.getClass('Nothing');
    }

    get Number(): SdsClass | undefined {
        return this.getClass('Number');
    }

    get String(): SdsClass | undefined {
        return this.getClass('String');
    }

    /**
     * Returns whether the given node is a builtin class.
     */
    isBuiltinClass(node: SdsClass | undefined): boolean {
        return (
            Boolean(node) &&
            [
                this.Any,
                this.Boolean,
                this.Float,
                this.Int,
                this.List,
                this.Map,
                this.Nothing,
                this.Number,
                this.String,
            ].includes(node)
        );
    }

    private getClass(name: string): SdsClass | undefined {
        return this.getModuleMember(CORE_CLASSES_URI, name, isSdsClass);
    }
}
