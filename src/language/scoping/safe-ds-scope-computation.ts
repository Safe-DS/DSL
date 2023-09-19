import {
    AstNode,
    AstNodeDescription,
    DefaultScopeComputation,
    getContainerOfType,
    LangiumDocument,
    PrecomputedScopes,
} from 'langium';
import {
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
    isSdsTypeParameter,
    isSdsTypeParameterList,
    SdsClass,
    SdsEnum,
    SdsTypeParameter,
} from '../generated/ast.js';

export class SafeDsScopeComputation extends DefaultScopeComputation {
    override processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): void {
        if (isSdsClass(node)) {
            this.processSdsClass(node, document, scopes);
        } else if (isSdsEnum(node)) {
            this.processSdsEnum(node, document, scopes);
        } else if (isSdsTypeParameter(node)) {
            this.processSdsTypeParameter(node, document, scopes);
        } else {
            super.processNode(node, document, scopes);
        }
    }

    private processSdsClass(node: SdsClass, document: LangiumDocument, scopes: PrecomputedScopes): void {
        const name = this.nameProvider.getName(node);
        if (!name) {
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        this.addToScopesIfKeyIsDefined(scopes, node.parameterList, description);
        this.addToScopesIfKeyIsDefined(scopes, node.constraintList, description);
        this.addToScopesIfKeyIsDefined(scopes, node.body, description);

        const containingDeclaration = getContainerOfType(node.$container, isSdsDeclaration);
        if (isSdsModule(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration, description);
        }
    }

    private processSdsEnum(node: SdsEnum, document: LangiumDocument, scopes: PrecomputedScopes): void {
        const name = this.nameProvider.getName(node);
        if (!name) {
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        this.addToScopesIfKeyIsDefined(scopes, node.body, description);

        const containingDeclaration = getContainerOfType(node.$container, isSdsDeclaration);
        if (isSdsModule(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration, description);
        }
    }

    private processSdsTypeParameter(
        node: SdsTypeParameter,
        document: LangiumDocument,
        scopes: PrecomputedScopes,
    ): void {
        const containingDeclaration = getContainerOfType(node, isSdsTypeParameterList)?.$container;
        if (!containingDeclaration) {
            return;
        }

        const name = this.nameProvider.getName(node);
        if (!name) {
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        if (isSdsClass(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parameterList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.constraintList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.body, description);
        } else if (isSdsEnumVariant(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parameterList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.constraintList, description);
        } else if (isSdsFunction(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parameterList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.resultList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.constraintList, description);
        }
    }

    /**
     * Adds the key/value pair to the scopes if the key is defined.
     *
     * @param scopes The scopes to add the key/value pair to.
     * @param key The key.
     * @param value The value.
     */
    addToScopesIfKeyIsDefined(scopes: PrecomputedScopes, key: AstNode | undefined, value: AstNodeDescription): void {
        if (key) {
            scopes.add(key, value);
        }
    }
}
