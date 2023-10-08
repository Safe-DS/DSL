import { SdsAnnotation } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty } from '../../../helpers/nodeProperties.js';

export const CODE_ANNOTATION_PARAMETER_CONST_MODIFIER = 'annotation/parameter-const-modifier';

export const annotationParameterShouldNotHaveConstModifier = (node: SdsAnnotation, accept: ValidationAcceptor) => {
    for (const parameter of parametersOrEmpty(node)) {
        if (parameter.isConstant) {
            accept('info', 'Parameters of annotations implicitly have the const modifier.', {
                node: parameter,
                property: 'name',
                code: CODE_ANNOTATION_PARAMETER_CONST_MODIFIER,
            });
        }
    }
};
