import { SafeDsServices } from '../safe-ds-module.js';
import { isSdsModule, SdsModuleMember } from '../generated/ast.js';
import { LangiumDocuments, URI, WorkspaceCache } from 'langium';
import { getModuleMembers } from '../helpers/nodeProperties.js';

export abstract class SafeDsModuleMembers<T extends SdsModuleMember> {
    private readonly langiumDocuments: LangiumDocuments;
    private readonly cache: WorkspaceCache<string, T>;

    constructor(services: SafeDsServices) {
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
        this.cache = new WorkspaceCache(services.shared);
    }

    protected getModuleMember(uri: URI, name: string, predicate: (node: unknown) => node is T): T | undefined {
        const key = `${uri.toString()}#${name}`;

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        if (!this.langiumDocuments.hasDocument(uri)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const document = this.langiumDocuments.getOrCreateDocument(uri);
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const firstMatchingModuleMember = getModuleMembers(root).find((m) => m.name === name);
        if (!predicate(firstMatchingModuleMember)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        this.cache.set(key, firstMatchingModuleMember);
        return firstMatchingModuleMember;
    }
}
