import { SafeDsServices } from '../safe-ds-module.js';
import { resolveRelativePathToBuiltinFile } from './fileFinder.js';
import { isSdsAnnotation, isSdsModule, SdsAnnotatedObject, SdsAnnotation } from '../generated/ast.js';
import { LangiumDocuments, WorkspaceCache } from 'langium';
import { annotationCallsOrEmpty, moduleMembersOrEmpty } from '../helpers/nodeProperties.js';

const CORE_ANNOTATIONS_URI = resolveRelativePathToBuiltinFile('safeds/lang/coreAnnotations.sdsstub');

export class SafeDsAnnotations {
    private readonly langiumDocuments: LangiumDocuments;
    private readonly cache: WorkspaceCache<string, SdsAnnotation>;

    constructor(services: SafeDsServices) {
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
        this.cache = new WorkspaceCache(services.shared);
    }

    isDeprecated(node: SdsAnnotatedObject | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const annotation = it.annotation?.ref;
            return annotation === this.Deprecated;
        });
    }

    isExperimental(node: SdsAnnotatedObject | undefined): boolean {
        return annotationCallsOrEmpty(node).some((it) => {
            const annotation = it.annotation?.ref;
            return annotation === this.Experimental;
        });
    }

    private get Deprecated(): SdsAnnotation | undefined {
        return this.getAnnotation('Deprecated');
    }

    private get Experimental(): SdsAnnotation | undefined {
        return this.getAnnotation('Experimental');
    }

    private getAnnotation(name: string): SdsAnnotation | undefined {
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        if (!this.langiumDocuments.hasDocument(CORE_ANNOTATIONS_URI)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const document = this.langiumDocuments.getOrCreateDocument(CORE_ANNOTATIONS_URI);
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const firstMatchingModuleMember = moduleMembersOrEmpty(root).find((m) => m.name === name);
        if (!isSdsAnnotation(firstMatchingModuleMember)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        this.cache.set(name, firstMatchingModuleMember);
        return firstMatchingModuleMember;
    }
}
