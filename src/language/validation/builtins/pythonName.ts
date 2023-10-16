import { ValidationAcceptor } from 'langium';
import { SdsDeclaration } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { findFirstAnnotationCallOf } from '../../helpers/nodeProperties.js';

export const CODE_PYTHON_NAME_SAME_AS_SAFE_DS_NAME = 'python-name/same-as-safe-ds-name';

export const pythonNameShouldDifferFromSafeDsName = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsDeclaration, accept: ValidationAcceptor) => {
        const pythonName = builtinAnnotations.getPythonName(node);
        if (!pythonName || pythonName !== node.name) {
            return;
        }

        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.PythonName)!;
        accept('info', 'The Python name is identical to the Safe-DS name, so the annotation call can be removed.', {
            node: annotationCall,
            code: CODE_PYTHON_NAME_SAME_AS_SAFE_DS_NAME,
        });
    };
};
