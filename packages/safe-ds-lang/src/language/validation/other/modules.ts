import { ValidationAcceptor } from 'langium';
import { isSdsDeclaration, SdsModule } from '../../generated/ast.js';
import { isInPipelineFile, isInStubFile } from '../../helpers/fileExtensions.js';
import { getModuleMembers, isImplementedDeclaration, isStubDeclaration } from '../../helpers/nodeProperties.js';
import { BUILTINS_ROOT_PACKAGE } from '../../builtins/packageNames.js';

export const CODE_MODULE_FORBIDDEN_IN_PIPELINE_FILE = 'module/forbidden-in-pipeline-file';
export const CODE_MODULE_FORBIDDEN_IN_STUB_FILE = 'module/forbidden-in-stub-file';
export const CODE_MODULE_MISSING_PACKAGE = 'module/missing-package';
export const CODE_MODULE_PIPELINE_FILE_IN_BUILTIN_PACKAGE = 'module/pipeline-file-in-builtin-package';

export const moduleDeclarationsMustMatchFileKind = (node: SdsModule, accept: ValidationAcceptor): void => {
    const declarations = node.members.filter(isSdsDeclaration);

    if (isInPipelineFile(node)) {
        for (const declaration of declarations) {
            if (!isImplementedDeclaration(declaration)) {
                accept('error', 'A pipeline file must only declare pipelines and segments.', {
                    node: declaration,
                    property: 'name',
                    code: CODE_MODULE_FORBIDDEN_IN_PIPELINE_FILE,
                });
            }
        }
    } else if (isInStubFile(node)) {
        for (const declaration of declarations) {
            if (!isStubDeclaration(declaration)) {
                accept('error', 'A stub file must not declare pipelines or segments.', {
                    node: declaration,
                    property: 'name',
                    code: CODE_MODULE_FORBIDDEN_IN_STUB_FILE,
                });
            }
        }
    }
};

export const moduleWithDeclarationsMustStatePackage = (node: SdsModule, accept: ValidationAcceptor): void => {
    if (!node.name) {
        const members = getModuleMembers(node);
        if (members.length > 0) {
            accept('error', 'A module with declarations must state its package.', {
                node: members[0]!,
                property: 'name',
                code: CODE_MODULE_MISSING_PACKAGE,
            });
        }
    }
};

export const pipelineFileMustNotBeInBuiltinPackage = (node: SdsModule, accept: ValidationAcceptor): void => {
    if (isInPipelineFile(node) && node.name?.startsWith(BUILTINS_ROOT_PACKAGE)) {
        accept('error', `A pipeline file must not be in a '${BUILTINS_ROOT_PACKAGE}' package.`, {
            node,
            property: 'name',
            code: CODE_MODULE_PIPELINE_FILE_IN_BUILTIN_PACKAGE,
        });
    }
};
