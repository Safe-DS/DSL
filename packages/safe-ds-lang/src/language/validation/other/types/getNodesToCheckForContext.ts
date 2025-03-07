import { isSdsTypeAlias, SdsType } from '../../../generated/ast.js';
import { AstNode } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const getNodesToCheckForContextProvider = (services: SafeDsServices) => {
    const langiumDocuments = services.shared.workspace.LangiumDocuments;
    const locator = services.workspace.AstNodeLocator;
    const referenceProvider = services.references.References;

    return (node: SdsType): AstNode[] => {
        const container = node.$container;

        if (isSdsTypeAlias(container)) {
            return referenceProvider
                .findReferences(container, { includeDeclaration: false })
                .flatMap((it) => {
                    const document = langiumDocuments.getDocument(it.sourceUri);
                    if (!document) {
                        /* c8 ignore next 2 */
                        return [];
                    }

                    const root = document.parseResult?.value;
                    if (!root) {
                        /* c8 ignore next 2 */
                        return [];
                    }

                    return locator.getAstNode(root, it.sourcePath) ?? [];
                })
                .toArray();
        } else {
            return [node];
        }
    };
};
