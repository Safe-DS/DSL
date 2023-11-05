import {
    type AstNode,
    type DocumentationProvider,
    findLeafNodeAtOffset,
    findNodesForKeyword,
    getContainerOfType,
    type LangiumDocument,
    type MaybePromise,
    type SignatureHelpProvider,
} from 'langium';
import type {
    CancellationToken,
    SignatureHelp,
    SignatureHelpOptions,
    SignatureHelpParams,
} from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import { isSdsAbstractCall } from '../generated/ast.js';
import { getParameters } from '../helpers/nodeProperties.js';
import { type SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { type SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';

export class SafeDsSignatureHelpProvider implements SignatureHelpProvider {
    private readonly documentationProvider: DocumentationProvider;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.documentationProvider = services.documentation.DocumentationProvider;
        this.nodeMapper = services.helpers.NodeMapper;
        this.typeComputer = services.types.TypeComputer;
    }

    provideSignatureHelp(
        document: LangiumDocument,
        params: SignatureHelpParams,
        _cancelToken?: CancellationToken,
    ): MaybePromise<SignatureHelp | undefined> {
        const rootCstNode = document.parseResult.value.$cstNode;
        if (!rootCstNode) {
            return undefined;
        }

        const offset = document.textDocument.offsetAt(params.position);
        const sourceCstNode = findLeafNodeAtOffset(rootCstNode, offset);
        if (!sourceCstNode) {
            return undefined;
        }

        return this.getSignature(sourceCstNode.astNode, offset);
    }

    /**
     * Returns the signature help for the given node at the given offset.
     */
    private getSignature(node: AstNode, offset: number): MaybePromise<SignatureHelp | undefined> {
        const containingAbstractCall = getContainerOfType(node, isSdsAbstractCall);
        if (!containingAbstractCall) {
            return undefined;
        }

        const callable = this.nodeMapper.callToCallable(containingAbstractCall);
        if (!callable) {
            return undefined;
        }

        const commas = findNodesForKeyword(containingAbstractCall.argumentList.$cstNode, ',');
        const activeParameter = commas.findLastIndex((comma) => comma.offset < offset) + 1;

        return {
            signatures: [
                {
                    label: this.typeComputer.computeType(callable).toString(),
                    parameters: getParameters(callable).map((parameter) => ({
                        label: parameter.name,
                    })),
                    documentation: createMarkupContent(this.documentationProvider.getDocumentation(callable)),
                },
            ],
            activeSignature: 0,
            activeParameter,
        };
    }

    get signatureHelpOptions(): SignatureHelpOptions {
        return {
            triggerCharacters: ['('],
            retriggerCharacters: [','],
        };
    }
}
