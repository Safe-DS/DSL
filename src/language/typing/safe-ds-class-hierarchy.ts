import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SdsClass } from '../generated/ast.js';
import { stream, Stream } from 'langium';
import { getParentTypes } from '../helpers/nodeProperties.js';
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
     * Returns `true` if the given node is equal to or a subclass of the given other node. If one of the nodes is
     * undefined, `false` is returned.
     */
    isEqualToOrSubclassOf(node: SdsClass | undefined, other: SdsClass | undefined): boolean {
        if (!node || !other) {
            return false;
        }

        // Nothing is a subclass of everything
        if (node === this.builtinClasses.Nothing) {
            return true;
        }

        return node === other || this.streamSuperclasses(node).includes(other);
    }

    /**
     * Returns a stream of all superclasses of the given class. Direct ancestors are returned first, followed by their
     * ancestors and so on. The class itself is not included in the stream unless there is a cycle in the inheritance
     * hierarchy.
     */
    streamSuperclasses(node: SdsClass | undefined): Stream<SdsClass> {
        if (!node) {
            return stream();
        }

        return stream(this.superclassesGenerator(node));
    }

    private *superclassesGenerator(node: SdsClass | undefined): Generator<SdsClass, void> {
        const visited = new Set<SdsClass>();
        let current = this.parentClassOrUndefined(node);
        while (current && !visited.has(current)) {
            yield current;
            visited.add(current);
            current = this.parentClassOrUndefined(current);
        }

        const anyClass = this.builtinClasses.Any;
        if (anyClass && node !== anyClass && !visited.has(anyClass)) {
            yield anyClass;
        }
    }

    /**
     * Returns the parent class of the given class, or undefined if there is no parent class. Only the first parent
     * type is considered, i.e. multiple inheritance is not supported.
     */
    private parentClassOrUndefined(node: SdsClass | undefined): SdsClass | undefined {
        const [firstParentType] = getParentTypes(node);
        const computedType = this.typeComputer.computeType(firstParentType);
        if (computedType instanceof ClassType) {
            return computedType.declaration;
        }

        return undefined;
    }
}

// fun SdsClass.superClassMembers() =
//     this.superClasses().flatMap { it.classMembersOrEmpty().asSequence() }
//
// // TODO only static methods can be hidden
// fun SdsFunction.hiddenFunction(): SdsFunction? {
//     val containingClassOrInterface = closestAncestorOrNull<SdsClass>() ?: return null
//     return containingClassOrInterface.superClassMembers()
//         .filterIsInstance<SdsFunction>()
//         .firstOrNull { it.name == name }
// }
//
// fun SdsClass?.inheritedNonStaticMembersOrEmpty(): Set<SdsAbstractDeclaration> {
//     return this?.parentClassesOrEmpty()
//         ?.flatMap { it.classMembersOrEmpty() }
// ?.filter { it is SdsAttribute && !it.isStatic || it is SdsFunction && !it.isStatic }
// ?.toSet()
//     .orEmpty()
// }
