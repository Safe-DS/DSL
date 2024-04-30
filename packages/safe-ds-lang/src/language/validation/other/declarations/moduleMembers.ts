import { SafeDsServices } from '../../../safe-ds-module.js';
import { isSdsPipeline, SdsModuleMember } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { DiagnosticTag } from 'vscode-languageserver';

export const CODE_MODULE_MEMBER_UNUSED = 'module-member/unused';

export const moduleMemberShouldBeUsed = (services: SafeDsServices) => {
    const referenceProvider = services.references.References;

    return (node: SdsModuleMember, accept: ValidationAcceptor) => {
        // Don't show this warning for pipelines or public declarations
        if (isSdsPipeline(node) || node.visibility === undefined) {
            return;
        }

        const references = referenceProvider.findReferences(node, {});
        if (references.isEmpty()) {
            accept('warning', 'This declaration is unused and can be removed.', {
                node,
                property: 'name',
                code: CODE_MODULE_MEMBER_UNUSED,
                tags: [DiagnosticTag.Unnecessary],
            });
        }
    };
};
