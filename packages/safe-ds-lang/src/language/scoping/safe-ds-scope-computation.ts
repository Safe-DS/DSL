import {
    AstNode,
    AstNodeDescription,
    AstUtils,
    DefaultScopeComputation,
    LangiumDocument,
    PrecomputedScopes,
} from 'langium';
import {
    isSdsAnnotation,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
    isSdsParameter,
    isSdsParameterList,
    isSdsPipeline,
    isSdsSegment,
    isSdsTypeParameter,
    isSdsTypeParameterList,
    SdsClass,
    SdsEnum,
    SdsEnumVariant,
    SdsParameter,
    SdsTypeParameter,
} from '../generated/ast.js';
import { isPrivate } from '../helpers/nodeProperties.js';

export class SafeDsScopeComputation extends DefaultScopeComputation {
    protected override exportNode(node: AstNode, exports: AstNodeDescription[], document: LangiumDocument): void {
        // Modules, pipelines, and private declarations cannot be referenced from other documents
        if (isSdsModule(node) || isSdsPipeline(node) || (isSdsDeclaration(node) && isPrivate(node))) {
            return;
        }

        // Modules that don't state their package don't export anything
        const containingModule = AstUtils.getContainerOfType(node, isSdsModule);
        if (!containingModule || !containingModule.name) {
            return;
        }

        super.exportNode(node, exports, document);
    }

    protected override processNode(node: AstNode, document: LangiumDocument, scopes: PrecomputedScopes): void {
        if (isSdsClass(node)) {
            this.processSdsClass(node, document, scopes);
        } else if (isSdsEnum(node)) {
            this.processSdsEnum(node, document, scopes);
        } else if (isSdsEnumVariant(node)) {
            this.processSdsEnumVariant(node, document, scopes);
        } else if (isSdsParameter(node)) {
            this.processSdsParameter(node, document, scopes);
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
        this.addToScopesIfKeyIsDefined(scopes, node.parentTypeList, description);
        this.addToScopesIfKeyIsDefined(scopes, node.constraintList, description);
        this.addToScopesIfKeyIsDefined(scopes, node.body, description);

        const containingDeclaration = AstUtils.getContainerOfType(node.$container, isSdsDeclaration);
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

        const containingDeclaration = AstUtils.getContainerOfType(node.$container, isSdsDeclaration);
        if (isSdsModule(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration, description);
        }
    }

    private processSdsEnumVariant(node: SdsEnumVariant, document: LangiumDocument, scopes: PrecomputedScopes): void {
        const name = this.nameProvider.getName(node);
        if (!name) {
            /* c8 ignore next 2 */
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        this.addToScopesIfKeyIsDefined(scopes, node.parameterList, description);
        this.addToScopesIfKeyIsDefined(scopes, node.constraintList, description);
    }

    private processSdsParameter(node: SdsParameter, document: LangiumDocument, scopes: PrecomputedScopes): void {
        const containingCallable = AstUtils.getContainerOfType(node, isSdsParameterList)?.$container;
        if (!containingCallable) {
            /* c8 ignore next 2 */
            return;
        }

        const name = this.nameProvider.getName(node);
        if (!name) {
            /* c8 ignore next 2 */
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        if (isSdsAnnotation(containingCallable)) {
            this.addToScopesIfKeyIsDefined(scopes, containingCallable.constraintList, description);
        } else if (isSdsClass(containingCallable)) {
            this.addToScopesIfKeyIsDefined(scopes, containingCallable.constraintList, description);
        } else if (isSdsEnumVariant(containingCallable)) {
            this.addToScopesIfKeyIsDefined(scopes, containingCallable.constraintList, description);
        } else if (isSdsFunction(containingCallable)) {
            this.addToScopesIfKeyIsDefined(scopes, containingCallable.constraintList, description);
        } else if (isSdsSegment(containingCallable)) {
            this.addToScopesIfKeyIsDefined(scopes, containingCallable.constraintList, description);
        }
    }

    private processSdsTypeParameter(
        node: SdsTypeParameter,
        document: LangiumDocument,
        scopes: PrecomputedScopes,
    ): void {
        const containingDeclaration = AstUtils.getContainerOfType(node, isSdsTypeParameterList)?.$container;
        if (!containingDeclaration) {
            /* c8 ignore next 2 */
            return;
        }

        const name = this.nameProvider.getName(node);
        if (!name) {
            /* c8 ignore next 2 */
            return;
        }

        const description = this.descriptions.createDescription(node, name, document);

        if (isSdsClass(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parameterList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parentTypeList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.body, description);
        } else if (isSdsFunction(containingDeclaration)) {
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.parameterList, description);
            this.addToScopesIfKeyIsDefined(scopes, containingDeclaration.resultList, description);
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
