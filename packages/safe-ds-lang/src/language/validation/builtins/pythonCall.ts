import { AstUtils, ValidationAcceptor } from 'langium';
import { isSdsClass, SdsFunction } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { findFirstAnnotationCallOf, getParameters, isStatic } from '../../helpers/nodeProperties.js';
import { pluralize } from '../../../helpers/strings.js';

export const CODE_PYTHON_MACRO_INVALID_TEMPLATE_EXPRESSION = 'python-macro/invalid-template-expression';

export const pythonCallMustOnlyContainValidTemplateExpressions = (services: SafeDsServices) => {
    const builtinAnnotations = services.builtins.Annotations;

    return (node: SdsFunction, accept: ValidationAcceptor) => {
        const pythonCall = builtinAnnotations.getPythonMacro(node);
        if (!pythonCall) {
            return;
        }

        // Get actual template expressions
        const match = pythonCall.matchAll(/\$[_a-zA-Z][_a-zA-Z0-9]*/gu);
        const actualTemplateExpressions = [...match].map((it) => it[0]);

        // Compute valid template expressions
        const validTemplateExpressions = new Set(getParameters(node).map((it) => `\$${it.name}`));
        if (AstUtils.hasContainerOfType(node, isSdsClass) && !isStatic(node)) {
            validTemplateExpressions.add('$this');
        }

        // Compute invalid template expressions
        const invalidTemplateExpressions = actualTemplateExpressions.filter((it) => !validTemplateExpressions.has(it));

        // Report invalid template expressions
        if (invalidTemplateExpressions.length > 0) {
            const kind = pluralize(invalidTemplateExpressions.length, 'template expression');
            const invalidTemplateExpressionsString = invalidTemplateExpressions.map((it) => `'${it}'`).join(', ');

            accept('error', `The ${kind} ${invalidTemplateExpressionsString} cannot be interpreted.`, {
                node: findFirstAnnotationCallOf(node, builtinAnnotations.PythonMacro)!,
                property: 'annotation',
                code: CODE_PYTHON_MACRO_INVALID_TEMPLATE_EXPRESSION,
            });
        }
    };
};
