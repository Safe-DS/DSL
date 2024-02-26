import {
    type AstNode,
    AstUtils,
    CstUtils,
    type DocumentationProvider,
    GrammarUtils,
    isNamed,
    type LangiumDocument,
    type MaybePromise,
} from 'langium';
import type {
    CancellationToken,
    SignatureHelp,
    SignatureHelpOptions,
    SignatureHelpParams,
} from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import { isSdsAbstractCall, SdsCallable, SdsParameter } from '../generated/ast.js';
import { getParameters, Parameter } from '../helpers/nodeProperties.js';
import { type SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { type SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { CallableType, NamedType } from '../typing/model.js';
import { SignatureHelpProvider } from 'langium/lsp';

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
        /* c8 ignore start */
        if (!rootCstNode) {
            return undefined;
        }
        /* c8 ignore stop */

        const offset = document.textDocument.offsetAt(params.position);
        const sourceCstNode = CstUtils.findLeafNodeAtOffset(rootCstNode, offset);
        /* c8 ignore start */
        if (!sourceCstNode) {
            return undefined;
        }
        /* c8 ignore stop */

        return this.getSignature(sourceCstNode.astNode, offset);
    }

    /**
     * Returns the signature help for the given node at the given offset.
     */
    private getSignature(node: AstNode, offset: number): MaybePromise<SignatureHelp | undefined> {
        const containingAbstractCall = AstUtils.getContainerOfType(node, isSdsAbstractCall);
        if (!containingAbstractCall) {
            return undefined;
        }

        const callable = this.nodeMapper.callToCallable(containingAbstractCall);
        if (!callable) {
            return undefined;
        }

        const commas = GrammarUtils.findNodesForKeyword(containingAbstractCall.argumentList.$cstNode, ',');
        const activeParameter = commas.findLastIndex((comma) => comma.offset < offset) + 1;

        return {
            signatures: [
                {
                    label: this.getLabel(callable),
                    parameters: getParameters(callable).map(this.getParameterInformation),
                    documentation: createMarkupContent(this.documentationProvider.getDocumentation(callable)),
                },
            ],
            activeSignature: 0,
            activeParameter,
        };
    }

    private getLabel(callable: SdsCallable): string {
        const type = this.typeComputer.computeType(callable);

        if (type instanceof NamedType) {
            return `${type.declaration.name}(${getParameters(callable)
                .map((it) => this.getParameterLabel(it))
                .join(', ')})`;
        } else if (type instanceof CallableType && isNamed(callable)) {
            return `${callable.name}${type}`;
        } else {
            return type.toString();
        }
    }

    private getParameterInformation = (parameter: SdsParameter) => {
        return {
            label: this.getParameterLabel(parameter),
        };
    };

    private getParameterLabel = (parameter: SdsParameter) => {
        const optionality = Parameter.isOptional(parameter) ? '?' : '';
        const type = this.typeComputer.computeType(parameter);
        return `${parameter.name}${optionality}: ${type}`;
    };

    /* c8 ignore start */
    get signatureHelpOptions(): SignatureHelpOptions {
        return {
            triggerCharacters: ['('],
            retriggerCharacters: [','],
        };
    }

    /* c8 ignore stop */
}
