import { AstUtils, CstUtils, EMPTY_STREAM, LangiumDocuments, References, stream, Stream } from 'langium';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { isSdsClass, isSdsNamedType, isSdsParentTypeList, SdsClass, type SdsClassMember } from '../generated/ast.js';
import { getClassMembers, getParentTypes, isStatic } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';

export class SafeDsClassHierarchy {
    private readonly builtinClasses: SafeDsClasses;
    private readonly langiumDocuments: LangiumDocuments;
    private readonly references: References;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;
        this.references = services.references.References;
    }

    /**
     * Returns `true` if the given node is equal to or a subclass of the given other node. If one of the nodes is
     * `undefined`, `false` is returned.
     */
    isEqualToOrSubclassOf(node: SdsClass | undefined, other: SdsClass | undefined): boolean {
        if (!node || !other) {
            return false;
        }

        // Nothing is a subclass of everything
        if (node === this.builtinClasses.Nothing) {
            return true;
        }

        return node === other || this.streamProperSuperclasses(node).includes(other);
    }

    /**
     * Returns a stream of all superclasses of the given class. Direct ancestors are returned first, followed by their
     * ancestors and so on. The class itself is not included in the stream unless there is a cycle in the inheritance
     * hierarchy.
     */
    streamProperSuperclasses(node: SdsClass | undefined): Stream<SdsClass> {
        if (!node) {
            return EMPTY_STREAM;
        }

        return stream(this.properSuperclassesGenerator(node));
    }

    private *properSuperclassesGenerator(node: SdsClass): Generator<SdsClass, void> {
        const visited = new Set<SdsClass>();
        let current = this.parentClass(node);
        while (current && !visited.has(current)) {
            yield current;
            visited.add(current);
            current = this.parentClass(current);
        }

        const anyClass = this.builtinClasses.Any;
        if (anyClass && node !== anyClass && !visited.has(anyClass)) {
            yield anyClass;
        }
    }

    /**
     * Returns a stream of all members of the superclasses of the given class. Direct ancestors are considered first,
     * followed by their ancestors and so on. The members of the class itself are not included in the stream.
     */
    streamSuperclassMembers(node: SdsClass | undefined): Stream<SdsClassMember> {
        if (!node) {
            return EMPTY_STREAM;
        }

        return this.streamProperSuperclasses(node).flatMap(getClassMembers);
    }

    /**
     * Returns a stream of all instance members that are inherited by the given class. Direct ancestors are considered
     * first, followed by their ancestors and so on. The members of the class itself are not included in the stream.
     */
    streamInheritedMembers(node: SdsClass | undefined): Stream<SdsClassMember> {
        if (!node) {
            return EMPTY_STREAM;
        }

        return this.streamProperSuperclasses(node)
            .flatMap(getClassMembers)
            .filter((it) => !isStatic(it));
    }

    /**
     * Returns the parent class of the given class, or undefined if there is no parent class. Only the first parent
     * type is considered, i.e. multiple inheritance is not supported.
     */
    private parentClass(node: SdsClass | undefined): SdsClass | undefined {
        const [firstParentType] = getParentTypes(node);
        if (isSdsNamedType(firstParentType)) {
            const declaration = firstParentType.declaration?.ref;
            if (isSdsClass(declaration)) {
                return declaration;
            }
        }

        return undefined;
    }

    /**
     * Returns the member that is overridden by the given member, or `undefined` if the member does not override
     * anything.
     */
    getOverriddenMember(node: SdsClassMember | undefined): SdsClassMember | undefined {
        // Static members cannot override anything
        if (!node || isStatic(node)) {
            return undefined;
        }

        // Don't consider members with the same name as a previous member
        const containingClass = AstUtils.getContainerOfType(node, isSdsClass);
        if (!containingClass) {
            return undefined;
        }
        const firstMemberWithSameName = getClassMembers(containingClass).find(
            (it) => !isStatic(it) && it.name === node.name,
        );
        if (firstMemberWithSameName !== node) {
            return undefined;
        }

        return this.streamSuperclassMembers(containingClass)
            .filter((it) => !isStatic(it) && it.name === node.name)
            .head();
    }

    /**
     * Returns a stream of all direct subclasses of the given class. There is no guarantee about the order in which the
     * subclasses are returned. The class itself is not included in the stream.
     *
     * Returns an empty stream for "Any".
     */
    streamDirectSubclasses(node: SdsClass | undefined): Stream<SdsClass> {
        if (!node || node === this.builtinClasses.Any) {
            return EMPTY_STREAM;
        }

        return this.references
            .findReferences(node, {
                includeDeclaration: false,
            })
            .flatMap((it) => {
                const document = this.langiumDocuments.getDocument(it.sourceUri);
                if (!document) {
                    /* c8 ignore next 2 */
                    return [];
                }

                const rootNode = document.parseResult.value;
                if (!rootNode.$cstNode) {
                    /* c8 ignore next 2 */
                    return [];
                }

                const targetCstNode = CstUtils.findLeafNodeAtOffset(rootNode.$cstNode, it.segment.offset);
                if (!targetCstNode) {
                    /* c8 ignore next 2 */
                    return [];
                }

                // Only consider the first parent type
                const targetNode = targetCstNode.astNode;
                if (!isSdsParentTypeList(targetNode.$container) || targetNode.$containerIndex !== 0) {
                    return [];
                }

                const containingClass = AstUtils.getContainerOfType(targetNode, isSdsClass);
                if (!containingClass) {
                    /* c8 ignore next 2 */
                    return [];
                }

                return [containingClass];
            });
    }
}
