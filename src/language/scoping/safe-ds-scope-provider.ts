import {
    AstNode,
    AstNodeDescription,
    AstReflection,
    DefaultScopeProvider,
    EMPTY_SCOPE,
    getContainerOfType,
    getDocument,
    ReferenceInfo,
    Scope,
} from 'langium';
import {
    isSdsAbstractCall,
    isSdsArgument,
    isSdsAssignment,
    isSdsBlock,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsImportedDeclaration,
    isSdsLambda,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsModule,
    isSdsNamedType,
    isSdsNamedTypeDeclaration,
    isSdsPlaceholder,
    isSdsQualifiedImport,
    isSdsReference,
    isSdsSegment,
    isSdsStatement,
    isSdsTypeArgument,
    isSdsWildcardImport,
    isSdsYield,
    SdsArgument,
    SdsDeclaration,
    SdsExpression,
    SdsImportedDeclaration,
    SdsMemberAccess,
    SdsMemberType,
    SdsNamedTypeDeclaration,
    SdsPlaceholder,
    SdsReference,
    SdsStatement,
    SdsType,
    SdsTypeArgument,
    SdsYield,
} from '../generated/ast.js';
import { isContainedIn } from '../helpers/astUtils.js';
import {
    getAbstractResults,
    getAssignees,
    getEnumVariants,
    getImportedDeclarations,
    getImports,
    getMatchingClassMembers,
    getPackageName,
    getParameters,
    getResults,
    getStatements,
    getTypeParameters,
    isStatic,
} from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { SafeDsPackageManager } from '../workspace/safe-ds-package-manager.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { ClassType, EnumVariantType } from '../typing/model.js';

export class SafeDsScopeProvider extends DefaultScopeProvider {
    private readonly astReflection: AstReflection;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly packageManager: SafeDsPackageManager;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super(services);

        this.astReflection = services.shared.AstReflection;
        this.nodeMapper = services.helpers.NodeMapper;
        this.packageManager = services.workspace.PackageManager;
        this.typeComputer = services.types.TypeComputer;
    }

    override getScope(context: ReferenceInfo): Scope {
        const node = context.container;

        if (isSdsArgument(node) && context.property === 'parameter') {
            return this.getScopeForArgumentParameter(node);
        } else if (isSdsImportedDeclaration(node) && context.property === 'declaration') {
            return this.getScopeForImportedDeclarationDeclaration(node);
        } else if (isSdsNamedType(node) && context.property === 'declaration') {
            if (isSdsMemberType(node.$container) && node.$containerProperty === 'member') {
                return this.getScopeForMemberTypeMember(node.$container);
            } else {
                return super.getScope(context);
            }
        } else if (isSdsReference(node) && context.property === 'target') {
            if (isSdsMemberAccess(node.$container) && node.$containerProperty === 'member') {
                return this.getScopeForMemberAccessMember(node.$container);
            } else {
                return this.getScopeForDirectReferenceTarget(node, context);
            }
        } else if (isSdsTypeArgument(node) && context.property === 'typeParameter') {
            return this.getScopeForTypeArgumentTypeParameter(node);
        } else if (isSdsYield(node) && context.property === 'result') {
            return this.getScopeForYieldResult(node);
        } else {
            return super.getScope(context);
        }
    }

    private getScopeForArgumentParameter(node: SdsArgument): Scope {
        const containingAbstractCall = getContainerOfType(node, isSdsAbstractCall);
        const callable = this.nodeMapper.callToCallable(containingAbstractCall);
        if (!callable) {
            return EMPTY_SCOPE;
        }

        const parameters = getParameters(callable);
        return this.createScopeForNodes(parameters);
    }

    private getScopeForImportedDeclarationDeclaration(node: SdsImportedDeclaration): Scope {
        const ownPackageName = getPackageName(node);

        const containingQualifiedImport = getContainerOfType(node, isSdsQualifiedImport);
        if (!containingQualifiedImport) {
            /* c8 ignore next 2 */
            return EMPTY_SCOPE;
        }

        const declarationsInPackage = this.packageManager.getDeclarationsInPackage(containingQualifiedImport.package, {
            nodeType: 'SdsDeclaration',
            hideInternal: containingQualifiedImport.package !== ownPackageName,
        });
        return this.createScope(declarationsInPackage);
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
     * @param node The type to get the referenced declaration for.
     * @returns The referenced declaration or undefined.
     */
    private getUniqueReferencedDeclarationForType(node: SdsType): SdsNamedTypeDeclaration | undefined {
        if (isSdsNamedType(node)) {
            return node.declaration?.ref;
        } else if (isSdsMemberType(node)) {
            return node.member?.declaration?.ref;
        } else {
            return undefined;
        }
    }

    private getScopeForMemberAccessMember(node: SdsMemberAccess): Scope {
        // Static access
        const declaration = this.getUniqueReferencedDeclarationForExpression(node.receiver);
        if (isSdsClass(declaration)) {
            const ownStaticMembers = getMatchingClassMembers(declaration, isStatic);
            // val superTypeMembers = receiverDeclaration.superClassMembers()
            //     .filter { it.isStatic() }
            //     .toList()
            //
            // return Scopes.scopeFor(ownStaticMembers, Scopes.scopeFor(superTypeMembers))
            return this.createScopeForNodes(ownStaticMembers);
        } else if (isSdsEnum(declaration)) {
            return this.createScopeForNodes(getEnumVariants(declaration));
        }

        // Call results
        let resultScope = EMPTY_SCOPE;
        if (isSdsCall(node.receiver)) {
            const callable = this.nodeMapper.callToCallable(node.receiver);
            const results = getAbstractResults(callable);

            if (results.length > 1) {
                return this.createScopeForNodes(results);
            } else {
                // If there is only one result, it can be accessed by name but members of the result with the same name
                // take precedence.
                resultScope = this.createScopeForNodes(results);
            }
        }

        // Members
        let receiverType = this.typeComputer.computeType(node.receiver);

        if (receiverType instanceof ClassType) {
            const ownInstanceMembers = getMatchingClassMembers(receiverType.declaration, (it) => !isStatic(it));
            // val superTypeMembers = type.sdsClass.superClassMembers()
            //     .filter { !it.isStatic() }
            //     .toList()
            //
            // Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers, resultScope))
            return this.createScopeForNodes(ownInstanceMembers, resultScope);
        } else if (receiverType instanceof EnumVariantType) {
            const parameters = getParameters(receiverType.declaration);
            return this.createScopeForNodes(parameters, resultScope);
        }

        return resultScope;
    }

    /**
     * Returns the unique declaration that is referenced by this expression. If the expression references none or
     * multiple declarations, undefined is returned.
     *
     * @param node The expression to get the referenced declaration for.
     * @returns The referenced declaration or undefined.
     */
    private getUniqueReferencedDeclarationForExpression(node: SdsExpression): SdsDeclaration | undefined {
        if (isSdsReference(node)) {
            return node.target.ref;
        } else if (isSdsMemberAccess(node)) {
            return node.member?.target?.ref;
        } else {
            return undefined;
        }
    }

    private getScopeForDirectReferenceTarget(node: SdsReference, context: ReferenceInfo): Scope {
        // Declarations in other files
        let currentScope = this.getGlobalScope('SdsDeclaration', context);

        // Declarations in this file
        currentScope = this.globalDeclarationsInSameFile(node, currentScope);

        // // Declarations in containing classes
        // context.containingClassOrNull()?.let {
        //     result = classMembers(it, result)
        // }
        //

        // Declarations in containing blocks
        return this.localDeclarations(node, currentScope);
    }

    // private fun classMembers(context: SdsClass, parentScope: IScope): IScope {
    //     return when (val containingClassOrNull = context.containingClassOrNull()) {
    //         is SdsClass -> Scopes.scopeFor(
    //             context.classMembersOrEmpty(),
    //             classMembers(containingClassOrNull, parentScope),
    //         )
    //     else -> Scopes.scopeFor(context.classMembersOrEmpty(), parentScope)
    //     }
    // }

    private globalDeclarationsInSameFile(node: AstNode, outerScope: Scope): Scope {
        const module = getContainerOfType(node, isSdsModule);
        if (!module) {
            /* c8 ignore next 2 */
            return outerScope;
        }

        const precomputed = getDocument(module).precomputedScopes?.get(module);
        if (!precomputed) {
            /* c8 ignore next 2 */
            return outerScope;
        }

        return this.createScope(precomputed, outerScope);
    }

    private localDeclarations(node: AstNode, outerScope: Scope): Scope {
        // Parameters
        const containingCallable = getContainerOfType(node.$container, isSdsCallable);
        const parameters = getParameters(containingCallable);

        // Placeholders up to the containing statement
        const containingStatement = getContainerOfType(node.$container, isSdsStatement);

        let placeholders: Iterable<SdsPlaceholder>;
        if (!containingCallable || isContainedIn(containingStatement, containingCallable)) {
            placeholders = this.placeholdersUpToStatement(containingStatement);
        } else {
            // Placeholders are further away than the parameters
            placeholders = [];
        }

        // Local declarations
        const localDeclarations = [...parameters, ...placeholders];

        // Lambdas can be nested
        if (isSdsLambda(containingCallable)) {
            return this.createScopeForNodes(localDeclarations, this.localDeclarations(containingCallable, outerScope));
        } else {
            return this.createScopeForNodes(localDeclarations, outerScope);
        }
    }

    private *placeholdersUpToStatement(
        statement: SdsStatement | undefined,
    ): Generator<SdsPlaceholder, void, undefined> {
        if (!statement) {
            return;
        }

        const containingBlock = getContainerOfType(statement, isSdsBlock);
        for (const current of getStatements(containingBlock)) {
            if (current === statement) {
                return;
            }

            if (isSdsAssignment(current)) {
                yield* getAssignees(current).filter(isSdsPlaceholder);
            }
        }
    }

    private getScopeForTypeArgumentTypeParameter(node: SdsTypeArgument): Scope {
        const containingNamedType = getContainerOfType(node, isSdsNamedType);
        if (!containingNamedType) {
            /* c8 ignore next 2 */
            return EMPTY_SCOPE;
        }

        const namedTypeDeclaration = containingNamedType.declaration?.ref;
        if (isSdsClass(namedTypeDeclaration)) {
            const typeParameters = getTypeParameters(namedTypeDeclaration.typeParameterList);
            return this.createScopeForNodes(typeParameters);
        } else if (isSdsEnumVariant(namedTypeDeclaration)) {
            const typeParameters = getTypeParameters(namedTypeDeclaration.typeParameterList);
            return this.createScopeForNodes(typeParameters);
        } else {
            return EMPTY_SCOPE;
        }
    }

    private getScopeForYieldResult(node: SdsYield): Scope {
        const containingSegment = getContainerOfType(node, isSdsSegment);
        if (!containingSegment) {
            return EMPTY_SCOPE;
        }

        return this.createScopeForNodes(getResults(containingSegment.resultList));
    }

    protected override getGlobalScope(referenceType: string, context: ReferenceInfo): Scope {
        const node = context.container;
        const key = `${getDocument(node).uri}~${referenceType}`;
        return this.globalScopeCache.get(key, () => this.getGlobalScopeForNode(referenceType, node));
    }

    private getGlobalScopeForNode(referenceType: string, node: AstNode): Scope {
        const ownPackageName = getPackageName(node);

        // Builtin declarations
        const builtinDeclarations = this.builtinDeclarations(referenceType);
        let outerScope = this.createScope(builtinDeclarations);

        // Declarations in the same package
        const declarationsInSamePackage = this.declarationsInSamePackage(ownPackageName, referenceType);
        outerScope = this.createScope(declarationsInSamePackage, outerScope);

        // Explicitly imported declarations
        const explicitlyImportedDeclarations = this.explicitlyImportedDeclarations(referenceType, node);
        return this.createScope(explicitlyImportedDeclarations, outerScope);
    }

    private builtinDeclarations(referenceType: string): AstNodeDescription[] {
        return this.packageManager.getDeclarationsInPackageOrSubpackage('safeds', {
            nodeType: referenceType,
            hideInternal: true,
        });
    }

    private declarationsInSamePackage(packageName: string | undefined, referenceType: string): AstNodeDescription[] {
        if (!packageName) {
            return [];
        }

        return this.packageManager.getDeclarationsInPackage(packageName, {
            nodeType: referenceType,
        });
    }

    private explicitlyImportedDeclarations(referenceType: string, node: AstNode): AstNodeDescription[] {
        const containingModule = getContainerOfType(node, isSdsModule);
        const imports = getImports(containingModule);

        const result: AstNodeDescription[] = [];
        for (const imp of imports) {
            if (isSdsQualifiedImport(imp)) {
                for (const importedDeclaration of getImportedDeclarations(imp)) {
                    const description = importedDeclaration.declaration.$nodeDescription;
                    if (!description || !this.astReflection.isSubtype(description.type, referenceType)) {
                        continue;
                    }

                    if (importedDeclaration.alias) {
                        result.push({ ...description, name: importedDeclaration.alias.alias });
                    } else {
                        result.push(description);
                    }
                }
            } else if (isSdsWildcardImport(imp)) {
                const declarationsInPackage = this.packageManager.getDeclarationsInPackage(imp.package, {
                    nodeType: referenceType,
                    hideInternal: true,
                });
                result.push(...declarationsInPackage);
            }
        }

        return result;
    }
}
