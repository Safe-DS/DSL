import { SdsParameter, SdsSegment } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_PARAMETER_UNUSED = 'parameter/unused';
export const CODE_PARAMETER_VARIADIC_AND_OPTIONAL = 'parameter/variadic-and-optional';

export const parameterMustNotBeVariadicAndOptional = (node: SdsParameter, accept: ValidationAcceptor) => {
    if (node.isVariadic && node.defaultValue) {
        accept('error', 'Variadic parameters must not be optional.', {
            node,
            property: 'name',
            code: CODE_PARAMETER_VARIADIC_AND_OPTIONAL,
        });
    }
};

export const segmentParameterShouldBeUsed =
    (services: SafeDsServices) => (node: SdsSegment, accept: ValidationAcceptor) => {
        for (const parameter of parametersOrEmpty(node)) {
            const usages = services.helpers.NodeMapper.parameterToReferences(parameter);

            if (usages.isEmpty()) {
                accept('warning', 'This parameter is unused and can be removed.', {
                    node: parameter,
                    property: 'name',
                    code: CODE_PARAMETER_UNUSED,
                });
            }
        }
    };
