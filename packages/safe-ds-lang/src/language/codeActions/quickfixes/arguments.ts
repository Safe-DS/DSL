import { Diagnostic, TextEdit } from 'vscode-languageserver';
import { LangiumDocument } from 'langium';
import { SafeDsServices } from '../../safe-ds-module.js';
import { isSdsArgumentList, SdsArgument } from '../../generated/ast.js';
import { Argument, Parameter } from '../../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../../helpers/safe-ds-node-mapper.js';
import { CodeActionAcceptor } from '../safe-ds-code-action-provider.js';
import { createQuickfixFromTextEditsToSingleDocument } from '../factories.js';

export const makeArgumentsAssignedToOptionalParametersNamed = (services: SafeDsServices) => {
    const locator = services.workspace.AstNodeLocator;
    const nodeMapper = services.helpers.NodeMapper;

    return (diagnostic: Diagnostic, document: LangiumDocument, acceptor: CodeActionAcceptor) => {
        const node = locator.getAstNode(document.parseResult.value, diagnostic.data.path);
        if (!isSdsArgumentList(node)) {
            return;
        }

        acceptor(
            createQuickfixFromTextEditsToSingleDocument(
                'Add names to arguments that are assigned to optional parameters.',
                diagnostic,
                document,
                node.arguments.flatMap((it) => ensureArgumentIsNamed(nodeMapper, it)),
                true,
            ),
        );
    };
};

const ensureArgumentIsNamed = (nodeMapper: SafeDsNodeMapper, argument: SdsArgument): TextEdit[] | TextEdit => {
    const cstNode = argument.$cstNode;

    if (!cstNode || Argument.isNamed(argument)) {
        return [];
    }

    const parameter = nodeMapper.argumentToParameter(argument);
    if (!parameter || Parameter.isRequired(parameter)) {
        return [];
    }

    const text = argument.$cstNode.text;

    return {
        range: cstNode.range,
        newText: `${parameter.name} = ${text}`,
    };
};
