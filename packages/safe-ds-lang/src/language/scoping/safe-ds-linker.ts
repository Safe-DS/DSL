import { AstNodeDescription, DefaultLinker, isLinkingError, LinkingError, ReferenceInfo } from 'langium';
import { isSdsMemberAccess, isSdsReference } from '../generated/ast.js';

export class SafeDsLinker extends DefaultLinker {
    override getCandidate(refInfo: ReferenceInfo): AstNodeDescription | LinkingError {
        const superResult = super.getCandidate(refInfo);

        if (!isLinkingError(superResult)) {
            return superResult;
        }

        const node = refInfo.container;

        // Create a default error message
        const message = `Could not find a declaration named '${refInfo.reference.$refText}' in this context.`;
        let resolution = 'Did you spell the name correctly and add all needed imports?';

        // Improve the error message if Python keywords False, True, or None are used as references
        if (isSdsReference(node) && refInfo.property === 'target' && !isSdsMemberAccess(node.$container)) {
            if (refInfo.reference.$refText === 'False') {
                resolution = "Did you mean to write 'false'?";
            } else if (refInfo.reference.$refText === 'True') {
                resolution = "Did you mean to write 'true'?";
            } else if (refInfo.reference.$refText === 'None') {
                resolution = "Did you mean to write 'null'?";
            }
        }

        return {
            ...superResult,
            message: `${message}\n${resolution}`,
        };
    }
}
