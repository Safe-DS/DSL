import {ValidationAcceptor} from 'langium';
import {isSdsDeclaration, isSdsPipeline, isSdsSegment, SdsDeclaration, SdsModule} from '../../generated/ast.js';
import {isInPipelineFile, isInStubFile} from '../../helpers/fileExtensions.js';

export const CODE_MODULE_MISSING_PACKAGE = 'module/missing-package';
export const CODE_MODULE_FORBIDDEN_IN_PIPELINE_FILE = 'module/forbidden-in-pipeline-file';
export const CODE_MODULE_FORBIDDEN_IN_STUB_FILE = 'module/forbidden-in-stub-file';

export const moduleWithDeclarationsMustStatePackage = (node: SdsModule, accept: ValidationAcceptor): void => {
    if (!node.name) {
        const declarations = node.members.filter(isSdsDeclaration);
        if (declarations.length > 0) {
            accept('error', 'A module with declarations must state its package.', {
                node: declarations[0],
                property: 'name',
                code: CODE_MODULE_MISSING_PACKAGE,
            });
        }
    }
};

export const moduleDeclarationsMustMatchFileKind = (node: SdsModule, accept: ValidationAcceptor): void => {
    const declarations = node.members.filter(isSdsDeclaration);

    if (isInPipelineFile(node)) {
        for (const declaration of declarations) {
            if (!declarationIsAllowedInPipelineFile(declaration)) {
                accept('error', 'A pipeline file must only declare pipelines and segments.', {
                    node: declaration,
                    property: 'name',
                    code: CODE_MODULE_FORBIDDEN_IN_PIPELINE_FILE,
                });
            }
        }
    } else if (isInStubFile(node)) {
        for (const declaration of declarations) {
            if (!declarationIsAllowedInStubFile(declaration)) {
                accept('error', 'A stub file must not declare pipelines or segments.', {
                    node: declaration,
                    property: 'name',
                    code: CODE_MODULE_FORBIDDEN_IN_STUB_FILE,
                });
            }
        }
    }
};

export const declarationIsAllowedInPipelineFile = (declaration: SdsDeclaration): boolean => {
    return isSdsPipeline(declaration) || isSdsSegment(declaration)
}

export const declarationIsAllowedInStubFile = (declaration: SdsDeclaration): boolean => {
    return !isSdsPipeline(declaration) && !isSdsSegment(declaration)
}
