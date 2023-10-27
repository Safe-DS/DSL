import { ValidationAcceptor } from 'langium';
import { SdsDeclaration, SdsFunction } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { findFirstAnnotationCallOf, hasAnnotationCallOf } from '../../helpers/nodeProperties.js';

export const CODE_PYTHON_NAME_MUTUALLY_EXCLUSIVE_WITH_PYTHON_CALL = 'python-name/mutually-exclusive-with-python-call';
export const CODE_PYTHON_NAME_SAME_AS_SAFE_DS_NAME = 'python-name/same-as-safe-ds-name';

export const pythonNameMustNotBeSetIfPythonCallIsSet = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        if (!hasAnnotationCallOf(node, builtinAnnotations.PythonCall)) {
            return;
        }

        const firstPythonName = findFirstAnnotationCallOf(node, builtinAnnotations.PythonName);
        if (!firstPythonName) {
            return;
        }

        accept('error', 'A Python name must not be set if a Python call is set.', {
            node: firstPythonName,
            property: 'annotation',
            code: CODE_PYTHON_NAME_MUTUALLY_EXCLUSIVE_WITH_PYTHON_CALL,
        });
    };
};

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
            property: 'annotation',
            code: CODE_PYTHON_NAME_SAME_AS_SAFE_DS_NAME,
        });
    };
};
