import { SafeDsServices } from '../safe-ds-module.js';
import { resolveRelativePathToBuiltinFile } from './fileFinder.js';
import {isSdsClass, isSdsModule, SdsClass} from "../generated/ast.js";
import {LangiumDocuments} from "langium";
import {moduleMembersOrEmpty} from "../helpers/shortcuts.js";

const CORE_CLASSES_URI = resolveRelativePathToBuiltinFile('safeds/lang/coreClasses.sdsstub');

export class SafeDsCoreClasses {
    private readonly langiumDocuments : LangiumDocuments;

    private cachedAny: SdsClass | undefined;
    private cachedNothing: SdsClass | undefined;
    private cachedBoolean: SdsClass | undefined;
    private cachedNumber: SdsClass | undefined;
    private cachedInt: SdsClass | undefined;
    private cachedFloat: SdsClass | undefined;
    private cachedString: SdsClass | undefined;

    constructor(services: SafeDsServices) {
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
    }

    get Any(): SdsClass | undefined {
        if (!this.cachedAny) {
            this.cachedAny = this.getClass('Any');
        }
        return this.cachedAny;
    }

    get Nothing(): SdsClass | undefined {
        if (!this.cachedNothing) {
            this.cachedNothing = this.getClass('Nothing');
        }
        return this.cachedNothing;
    }

    get Boolean(): SdsClass | undefined {
        if (!this.cachedBoolean) {
            this.cachedBoolean = this.getClass('Boolean');
        }
        return this.cachedBoolean;
    }

    get Number(): SdsClass | undefined {
        if (!this.cachedNumber) {
            this.cachedNumber = this.getClass('Number');
        }
        return this.cachedNumber;
    }

    get Int(): SdsClass | undefined {
        if (!this.cachedInt) {
            this.cachedInt = this.getClass('Int');
        }
        return this.cachedInt;
    }

    get Float(): SdsClass | undefined {
        if (!this.cachedFloat) {
            this.cachedFloat = this.getClass('Float');
        }
        return this.cachedFloat;
    }

    get String(): SdsClass | undefined {
        if (!this.cachedString) {
            this.cachedString = this.getClass('String');
        }
        return this.cachedString;
    }

    private getClass(name: string): SdsClass | undefined {
        if (!this.langiumDocuments.hasDocument(CORE_CLASSES_URI)) {
            return undefined;
        }

        const document = this.langiumDocuments.getOrCreateDocument(CORE_CLASSES_URI);
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const firstMatchingModuleMember =  moduleMembersOrEmpty(root).find(m => m.name === name);
        if (!isSdsClass(firstMatchingModuleMember)) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return firstMatchingModuleMember;
    }
}
