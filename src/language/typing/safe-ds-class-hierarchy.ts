import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SdsClass } from '../generated/ast.js';
import { stream, Stream } from 'langium';
import { parentTypesOrEmpty } from '../helpers/nodeProperties.js';
import { SafeDsTypeComputer } from './safe-ds-type-computer.js';
import { ClassType } from './model.js';

export class SafeDsClassHierarchy {
    private readonly builtinClasses: SafeDsClasses;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.typeComputer = services.types.TypeComputer;
    }

    /**
     * Returns a stream of all superclasses of the given class. The class itself is not included in the stream unless
     * there is a cycle in the inheritance hierarchy. Direct ancestors are returned first, followed by their ancestors
     * and so on.
     */
    streamSuperclasses(node: SdsClass | undefined): Stream<SdsClass> {
        if (!node) {
            return stream();
        }

        const capturedThis = this;
        const generator = function* () {
            const visited = new Set<SdsClass>();
            let current = capturedThis.parentClassOrUndefined(node);
            while (current && !visited.has(current)) {
                yield current;
                visited.add(current);
                current = capturedThis.parentClassOrUndefined(current);
            }

            const anyClass = capturedThis.builtinClasses.Any;
            if (anyClass && node !== anyClass && !visited.has(anyClass)) {
                yield anyClass;
            }
        };

        return stream((generator)());
    }

    /**
     * Returns the parent class of the given class, or undefined if there is no parent class. Only the first parent
     * type is considered, i.e. multiple inheritance is not supported.
     */
    private parentClassOrUndefined(node: SdsClass | undefined): SdsClass | undefined {
        const [firstParentType] = parentTypesOrEmpty(node);
        const computedType = this.typeComputer.computeType(firstParentType);
        if (computedType instanceof ClassType) {
            return computedType.sdsClass;
        }

        return undefined;
    }
}
