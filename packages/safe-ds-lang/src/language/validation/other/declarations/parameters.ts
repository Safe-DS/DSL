import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isSdsAnnotation, isSdsCallable, SdsParameter } from '../../../generated/ast.js';
import { Enum, EnumVariant, Parameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { ClassType, EnumType, EnumVariantType, LiteralType, type Type, UnknownType } from '../../../typing/model.js';

export const CODE_PARAMETER_CONSTANT_DEFAULT_VALUE = 'parameter/constant-default-value';
export const CODE_PARAMETER_CONSTANT_TYPE = 'parameter/constant-type';

export const constantParameterMustHaveConstantDefaultValue = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!Parameter.isConstant(node) || !node.defaultValue) return;

        const evaluatedDefaultValue = partialEvaluator.evaluate(node.defaultValue);
        if (!evaluatedDefaultValue.isFullyEvaluated) {
            const containingCallable = getContainerOfType(node, isSdsCallable);
            const kind = isSdsAnnotation(containingCallable) ? 'annotation' : 'constant';

            accept('error', `Default values of ${kind} parameters must be constant.`, {
                node,
                property: 'defaultValue',
                code: CODE_PARAMETER_CONSTANT_DEFAULT_VALUE,
            });
        }
    };
};

export const constantParameterMustHaveTypeThatCanBeEvaluatedToConstant = (services: SafeDsServices) => {
    const isConstantType = isConstantTypeProvider(services);
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!Parameter.isConstant(node) || !node.type) {
            return;
        }

        const type = typeComputer.computeType(node);
        if (!isConstantType(type)) {
            accept(
                'error',
                `The parameter must be a constant but type '${type.toString()}' cannot be evaluated to a constant.`,
                {
                    node,
                    property: 'type',
                    code: CODE_PARAMETER_CONSTANT_TYPE,
                },
            );
        }
    };
};

const isConstantTypeProvider = (services: SafeDsServices) => {
    const builtinClasses = services.builtins.Classes;

    return (type: Type): boolean => {
        if (type instanceof ClassType) {
            return builtinClasses.isBuiltinClass(type.declaration);
        } else if (type instanceof EnumType) {
            return Enum.isConstant(type.declaration);
        } else if (type instanceof EnumVariantType) {
            return EnumVariant.isConstant(type.declaration);
        } else {
            return type instanceof LiteralType || type === UnknownType;
        }
    };
};
