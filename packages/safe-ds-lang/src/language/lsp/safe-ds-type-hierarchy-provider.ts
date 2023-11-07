import type { LangiumDocument } from 'langium';
import type {
    CancellationToken,
    TypeHierarchyItem,
    TypeHierarchyPrepareParams,
    TypeHierarchySubtypesParams,
    TypeHierarchySupertypesParams,
} from 'vscode-languageserver';
import type { SafeDsServices } from '../safe-ds-module.js';

export interface TypeHierarchyProvider {
    prepareTypeHierarchy(
        document: LangiumDocument,
        params: TypeHierarchyPrepareParams,
        cancelToken?: CancellationToken,
    ): TypeHierarchyItem[] | undefined;

    supertypes(param: TypeHierarchySupertypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined;

    subtypes(param: TypeHierarchySubtypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined;
}

export abstract class AbstractTypeHierarchyProvider implements TypeHierarchyProvider {
    prepareTypeHierarchy(
        document: LangiumDocument,
        params: TypeHierarchyPrepareParams,
        cancelToken?: CancellationToken,
    ): TypeHierarchyItem[] | undefined {
        console.log('prepare');
        return undefined;
    }

    subtypes(param: TypeHierarchySubtypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined {
        console.log('subtypes');
        return undefined;
    }

    supertypes(param: TypeHierarchySupertypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined {
        console.log('supertypes');
        return undefined;
    }
}

export class SafeDsTypeHierarchyProvider extends AbstractTypeHierarchyProvider {
    constructor(services: SafeDsServices) {
        super();
    }
}
