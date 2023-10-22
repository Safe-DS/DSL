import { ValidationAcceptor } from 'langium';
import { SdsClass } from '../generated/ast.js';
import { parentTypesOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, UnknownType } from '../typing/model.js';
import { isEmpty } from '../../helpers/collectionUtils.js';

export const CODE_INHERITANCE_CYCLE = 'inheritance/cycle';
export const CODE_INHERITANCE_MULTIPLE_INHERITANCE = 'inheritance/multiple-inheritance';
export const CODE_INHERITANCE_NOT_A_CLASS = 'inheritance/not-a-class';

export const classMustOnlyInheritASingleClass = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;
    const computeType = typeComputer.computeType.bind(typeComputer);

    return (node: SdsClass, accept: ValidationAcceptor): void => {
        const parentTypes = parentTypesOrEmpty(node);
        if (isEmpty(parentTypes)) {
            return;
        }

        const [firstParentType, ...otherParentTypes] = parentTypes;

        // First parent type must be a class
        const computedType = computeType(firstParentType);
        if (computedType !== UnknownType && !(computedType instanceof ClassType)) {
            accept('error', 'A class must only inherit classes.', {
                node: firstParentType,
                code: CODE_INHERITANCE_NOT_A_CLASS,
            });
        }

        // Must have only one parent type
        for (const parentType of otherParentTypes) {
            accept('error', 'Multiple inheritance is not supported. Only the first parent type will be considered.', {
                node: parentType,
                code: CODE_INHERITANCE_MULTIPLE_INHERITANCE,
            });
        }
    };
};

export const classMustNotInheritItself = (services: SafeDsServices) => {
    const classHierarchy = services.types.ClassHierarchy;

    return (node: SdsClass, accept: ValidationAcceptor): void => {
        const superClasses = classHierarchy.streamSuperclasses(node);
        if (superClasses.includes(node)) {
            accept('error', 'A class must not directly or indirectly be a subtype of itself.', {
                node: parentTypesOrEmpty(node)[0],
                code: CODE_INHERITANCE_CYCLE,
            });
        }
    };
};
