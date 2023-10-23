import { ValidationAcceptor } from 'langium';
import { SdsModule } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { findFirstAnnotationCallOf } from '../../helpers/nodeProperties.js';

export const CODE_PYTHON_MODULE_SAME_AS_SAFE_DS_PACKAGE = 'python-module/same-as-safe-ds-package';

export const pythonModuleShouldDifferFromSafeDsPackage = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsModule, accept: ValidationAcceptor) => {
        const pythonModule = builtinAnnotations.getPythonModule(node);
        if (!pythonModule || pythonModule !== node.name) {
            return;
        }

        const annotationCall = findFirstAnnotationCallOf(node, builtinAnnotations.PythonModule)!;
        accept(
            'info',
            'The Python module is identical to the Safe-DS package, so the annotation call can be removed.',
            {
                node: annotationCall,
                property: 'annotation',
                code: CODE_PYTHON_MODULE_SAME_AS_SAFE_DS_PACKAGE,
            },
        );
    };
};
