import {
    AstNode,
    AstNodeDescription,
    AstNodeDescriptionProvider,
    AstNodeLocator,
    DefaultScopeProvider,
    EMPTY_SCOPE,
    getContainerOfType,
    getDocument,
    LangiumDocuments,
    LangiumServices,
    MultiMap,
    ReferenceInfo,
    Scope,
    Stream,
} from 'langium';
import {
    isSdsAssignment,
    isSdsBlock,
    isSdsCallable,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsLambda,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsModule,
    isSdsNamedType,
    isSdsNamedTypeDeclaration,
    isSdsPlaceholder,
    isSdsReference,
    isSdsSegment,
    isSdsStatement,
    isSdsTypeArgument,
    isSdsYield,
    SdsDeclaration,
    SdsExpression,
    SdsImport,
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
import {
    assigneesOrEmpty,
    classMembersOrEmpty,
    enumVariantsOrEmpty,
    importsOrEmpty,
    packageNameOrNull,
    parametersOrEmpty,
    resultsOrEmpty,
    statementsOrEmpty,
    typeParametersOrEmpty,
} from '../helpers/shortcuts.js';
import { isContainedIn } from '../helpers/ast.js';
import { isStatic, isWildcardImport } from '../helpers/checks.js';

export class SafeDsScopeProvider extends DefaultScopeProvider {
    readonly documents: LangiumDocuments;
    readonly astNodeDescriptionProvider: AstNodeDescriptionProvider;
    readonly astNodeLocator: AstNodeLocator;

    constructor(services: LangiumServices) {
        super(services);

        this.documents = services.shared.workspace.LangiumDocuments;
        this.astNodeDescriptionProvider = services.workspace.AstNodeDescriptionProvider;
        this.astNodeLocator = services.workspace.AstNodeLocator;
    }

    override getScope(context: ReferenceInfo): Scope {
        const node = context.container;

        if (isSdsNamedType(node) && context.property === 'declaration') {
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
            return node.declaration.ref;
        } else if (isSdsMemberType(node)) {
            return node.member.declaration.ref;
        } else {
            return undefined;
        }
    }

    private getScopeForMemberAccessMember(node: SdsMemberAccess): Scope {
        let currentScope = EMPTY_SCOPE;

        // Static access
        const declaration = this.getUniqueReferencedDeclarationForExpression(node.receiver);
        if (isSdsClass(declaration)) {
            currentScope = this.createScopeForNodes(classMembersOrEmpty(declaration, isStatic));

            //     val superTypeMembers = receiverDeclaration.superClassMembers()
            //         .filter { it.isStatic() }
            // .toList()
            //
            //     return Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers))
        } else if (isSdsEnum(declaration)) {
            currentScope = this.createScopeForNodes(enumVariantsOrEmpty(declaration));
        }

        //     // Call results
        //     var resultScope = IScope.NULLSCOPE
        //     if (receiver is SdsCall) {
        //         val results = receiver.resultsOrNull()
        //         when {
        //             results == null -> return IScope.NULLSCOPE
        //             results.size > 1 -> return Scopes.scopeFor(results)
        //             results.size == 1 -> resultScope = Scopes.scopeFor(results)
        //         }
        //     }
        //
        //     // Members
        //     val type = (receiver.type() as? NamedType) ?: return resultScope
        //
        //     return when {
        //         type.isNullable && !context.isNullSafe -> resultScope
        //         type is ClassType -> {
        //             val members = type.sdsClass.classMembersOrEmpty().filter { !it.isStatic() }
        //             val superTypeMembers = type.sdsClass.superClassMembers()
        //                 .filter { !it.isStatic() }
        //         .toList()
        //
        //             Scopes.scopeFor(members, Scopes.scopeFor(superTypeMembers, resultScope))
        //         }
        //         type is EnumVariantType -> Scopes.scopeFor(type.sdsEnumVariant.parametersOrEmpty())
        //     else -> resultScope
        //     }

        return currentScope;
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
            return node.member.target.ref;
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
        const parameters = parametersOrEmpty(containingCallable?.parameterList);

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
        for (const current of statementsOrEmpty(containingBlock)) {
            if (current === statement) {
                return;
            }

            if (isSdsAssignment(current)) {
                yield* assigneesOrEmpty(current).filter(isSdsPlaceholder);
            }
        }
    }

    private getScopeForTypeArgumentTypeParameter(node: SdsTypeArgument): Scope {
        const containingNamedType = getContainerOfType(node, isSdsNamedType);
        if (!containingNamedType) {
            /* c8 ignore next 2 */
            return EMPTY_SCOPE;
        }

        const namedTypeDeclaration = containingNamedType.declaration.ref;
        if (isSdsClass(namedTypeDeclaration)) {
            const typeParameters = typeParametersOrEmpty(namedTypeDeclaration.typeParameterList);
            return this.createScopeForNodes(typeParameters);
        } else if (isSdsEnumVariant(namedTypeDeclaration)) {
            const typeParameters = typeParametersOrEmpty(namedTypeDeclaration.typeParameterList);
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

        return this.createScopeForNodes(resultsOrEmpty(containingSegment.resultList));
    }

    protected override getGlobalScope(referenceType: string, context: ReferenceInfo): Scope {
        const node = context.container;
        const key = `${getDocument(node).uri}~${referenceType}`;
        return this.globalScopeCache.get(key, () => this.getGlobalScopeForNode(referenceType, node));
    }

    private getGlobalScopeForNode(referenceType: string, node: AstNode): Scope {
        // Gather information about the containing module
        const containingModule = getContainerOfType(node, isSdsModule);
        const ownUri = getDocument(node).uri.toString();
        const ownPackageName = containingModule?.name;

        // Data structures to collect reachable declarations
        const explicitlyImportedDeclarations = new ImportedDeclarations(
            this.astNodeDescriptionProvider,
            importsOrEmpty(containingModule),
        );
        const declarationsInSamePackage: AstNodeDescription[] = [];
        const builtinDeclarations: AstNodeDescription[] = [];

        // Loop over all declarations in the index
        const candidates = this.indexManager.allElements(referenceType);
        for (const candidate of candidates) {
            // Skip declarations in the same file
            const candidateUri = candidate.documentUri.toString();
            if (candidateUri === ownUri) {
                continue;
            }

            // Skip declarations that cannot be found and modules
            const candidateNode = this.loadAstNode(candidate);
            if (!candidateNode || isSdsModule(candidateNode)) {
                continue;
            }

            // Skip declarations in a module without a package name
            const candidatePackageName = packageNameOrNull(candidateNode);
            if (candidatePackageName === null) {
                continue;
            }

            // Handle internal segments, which are only reachable in the same package
            if (isSdsSegment(candidateNode) && candidateNode.visibility === 'internal') {
                if (candidatePackageName === ownPackageName) {
                    declarationsInSamePackage.push(candidate);
                }
                continue;
            }

            // Handle explicitly imported declarations
            explicitlyImportedDeclarations.addIfImported(candidateNode, candidatePackageName);

            // Handle other declarations in the same package
            if (candidatePackageName === ownPackageName) {
                declarationsInSamePackage.push(candidate);
                continue;
            }

            // Handle builtin declarations
            if (this.isBuiltinPackage(candidatePackageName)) {
                builtinDeclarations.push(candidate);
            }
        }

        // Order of precedence:
        //     Highest: Explicitly imported declarations
        //     Middle:  Declarations in the same package
        //     Lowest:  Builtin declarations
        const result =  this.createScope(
            explicitlyImportedDeclarations.getDescriptions(),
            this.createScope(declarationsInSamePackage, this.createScope(builtinDeclarations, EMPTY_SCOPE)),
        );

        return result;
    }

    private loadAstNode(nodeDescription: AstNodeDescription): AstNode | undefined {
        if (nodeDescription.node) {
            return nodeDescription.node;
        }
        const document = this.documents.getOrCreateDocument(nodeDescription.documentUri);
        return this.astNodeLocator.getAstNode(document.parseResult.value, nodeDescription.path);
    }

    private isBuiltinPackage(packageName: string) {
        return packageName.startsWith('safeds');
    }
}

/**
 * Collects descriptions of imported declarations in the same order as the imports.
 */
class ImportedDeclarations {
    private readonly astNodeDescriptionProvider: AstNodeDescriptionProvider;
    private readonly descriptionsByImport = new MultiMap<SdsImport, AstNodeDescription>();

    constructor(astNodeDescriptionProvider: AstNodeDescriptionProvider, imports: SdsImport[]) {
        this.astNodeDescriptionProvider = astNodeDescriptionProvider;

        // Remember the imports and their order
        for (const imp of imports) {
            this.descriptionsByImport.addAll(imp, []);
        }
    }

    /**
     * Adds the node if it is imported.
     *
     * @param node The node to add.
     * @param packageName The package name of the containing module.
     * @returns Whether the corresponding node is imported.
     */
    addIfImported(node: AstNode, packageName: string): boolean {
        if (!isSdsDeclaration(node)) {
            return false;
        }

        const firstMatchingImport = this.findFirstMatchingImport(node, packageName);
        if (!firstMatchingImport) {
            return false;
        }

        const description = this.createDescription(node, firstMatchingImport);
        this.descriptionsByImport.add(firstMatchingImport, description);
        return true;
    }

    private findFirstMatchingImport(node: SdsDeclaration, packageName: string): SdsImport | undefined {
        return this.descriptionsByImport.keys().find((imp) => this.importMatches(imp, node, packageName));
    }

    private importMatches(imp: SdsImport, node: SdsDeclaration, packageName: string): boolean {
        if (isWildcardImport(imp)) {
            const importedPackageName = imp.importedNamespace.replaceAll(/\.?\*$/gu, '');
            return importedPackageName === packageName;
        } else {
            const segments = imp.importedNamespace.split('.');
            const importedPackageName = segments.slice(0, segments.length - 1).join('.');
            const importedDeclarationName = segments[segments.length - 1];
            return importedPackageName === packageName && importedDeclarationName === node.name;
        }
    }

    private createDescription(node: SdsDeclaration, firstMatchingImport: SdsImport): AstNodeDescription {
        if (isWildcardImport(firstMatchingImport) || !firstMatchingImport.alias) {
            const description = this.astNodeDescriptionProvider.createDescription(node, node.name);
            description.node = undefined;
            return description;
        } else {
            const description = this.astNodeDescriptionProvider.createDescription(node, firstMatchingImport.alias.name);
            description.node = undefined;
            return description;
        }
    }

    /**
     * Returns descriptions of all imported declarations in the order of the imports.
     */
    getDescriptions(): Stream<AstNodeDescription> {
        return this.descriptionsByImport.values().flat();
    }
}
