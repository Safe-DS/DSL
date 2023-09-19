import { DefaultScopeProvider, EMPTY_SCOPE, getContainerOfType, ReferenceInfo, Scope } from 'langium';
import {
    isSdsClass,
    isSdsEnum,
    isSdsMemberType,
    isSdsNamedType, isSdsNamedTypeDeclaration,
    isSdsSegment,
    isSdsYield,
    SdsMemberType,
    SdsNamedTypeDeclaration,
    SdsType,
    SdsYield,
} from '../generated/ast.js';
import { resultsOrEmpty } from '../helpers/astShortcuts.js';

export class SafeDsScopeProvider extends DefaultScopeProvider {
    override getScope(context: ReferenceInfo): Scope {
        if (isSdsNamedType(context.container) && context.property === 'declaration') {
            const node = context.container;

            if (isSdsMemberType(node.$container) && node.$containerProperty === 'member') {
                return this.getScopeForMemberTypeMember(node.$container);
            } else {
                return super.getScope(context);
            }
        } else if (isSdsYield(context.container) && context.property === 'result') {
            return this.getScopeForYieldResult(context.container);
        } else {
            return super.getScope(context);
        }
    }

    private getScopeForMemberTypeMember(node: SdsMemberType): Scope {
        const declaration = this.getUniqueReferencedDeclarationForType(node.receiver);
        if (!declaration) {
            return EMPTY_SCOPE;
        }

        if (isSdsClass(declaration)) {
            const members = declaration.body?.members ?? [];
            return this.createScopeForNodes(members.filter(isSdsNamedTypeDeclaration));
        } else if (isSdsEnum(declaration)) {
            const variants = declaration.body?.variants ?? [];
            return this.createScopeForNodes(variants);
        } else {
            return EMPTY_SCOPE;
        }
    }

    /**
     * Returns the unique declaration that is referenced by this type. If the type references none or multiple
     * declarations, undefined is returned.
     *
     * @param type The type to get the referenced declaration for.
     * @returns The referenced declaration or undefined.
     */
    private getUniqueReferencedDeclarationForType(type: SdsType): SdsNamedTypeDeclaration | undefined {
        if (isSdsNamedType(type)) {
            return type.declaration.ref;
        } else if (isSdsMemberType(type)) {
            return type.member.declaration.ref;
        } else {
            return undefined;
        }
    }

    private getScopeForYieldResult(node: SdsYield): Scope {
        const containingSegment = getContainerOfType(node, isSdsSegment);
        if (!containingSegment) {
            return EMPTY_SCOPE;
        }

        return this.createScopeForNodes(resultsOrEmpty(containingSegment.resultList));
    }
}
