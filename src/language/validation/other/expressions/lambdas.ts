import { SdsLambda } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty } from '../../../helpers/nodeProperties.js';

export const CODE_LAMBDA_CONST_MODIFIER = 'lambda/const-modifier';

export const lambdaParameterMustNotHaveConstModifier = (node: SdsLambda, accept: ValidationAcceptor): void => {
    for (const parameter of parametersOrEmpty(node)) {
        if (parameter.isConstant) {
            accept('error', 'The const modifier is not applicable to parameters of lambdas.', {
                node: parameter,
                property: 'isConstant',
                code: CODE_LAMBDA_CONST_MODIFIER,
            });
        }
    }
};
