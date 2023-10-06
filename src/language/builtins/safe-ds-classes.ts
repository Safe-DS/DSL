import { SafeDsServices } from '../safe-ds-module.js';
import { resolveRelativePathToBuiltinFile } from './fileFinder.js';
import { isSdsClass, isSdsModule, SdsClass } from '../generated/ast.js';
import { LangiumDocuments } from 'langium';
import { moduleMembersOrEmpty } from '../helpers/nodeProperties.js';

const CORE_CLASSES_URI = resolveRelativePathToBuiltinFile('safeds/lang/coreClasses.sdsstub');

export class SafeDsClasses {
    private readonly langiumDocuments: LangiumDocuments;
    private readonly cache: Map<string, SdsClass> = new Map();

    constructor(services: SafeDsServices) {
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
    }

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
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        if (!this.langiumDocuments.hasDocument(CORE_CLASSES_URI)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const document = this.langiumDocuments.getOrCreateDocument(CORE_CLASSES_URI);
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const firstMatchingModuleMember = moduleMembersOrEmpty(root).find((m) => m.name === name);
        if (!isSdsClass(firstMatchingModuleMember)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return firstMatchingModuleMember;
    }
}
