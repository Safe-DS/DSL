import { SafeDsServices } from '../safe-ds-module.js';
import { GenericRequestType } from './types.js';
import { LangiumSharedServices } from 'langium/lsp';
import { AstNode, LangiumDocument } from 'langium';
import { parse } from './ast-parser/parser.js';
import { AstInterface } from '../../../../safe-ds-vscode/src/extension/custom-editor/messaging/getAst.js';

const LOGGING_TAG = 'CustomEditor] [AstParser';

const getAstHandler = async (
    message: AstInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<AstInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;
    if (!['sds', 'sdsstub', 'sdsdev'].includes(message.uri.path.split('.').reverse()[0]!)) {
        logger.error(LOGGING_TAG, `Document <${message.uri.path}> is not parseable`);
        return { ast: '' };
    }

    let targetDocument: LangiumDocument<AstNode> = await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
        message.uri,
    );
    if (!sharedServices.workspace.LangiumDocuments.hasDocument(message.uri)) {
        await sharedServices.workspace.DocumentBuilder.build([targetDocument]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newAST = parse(targetDocument, safeDsServices);

    return {
        error: {
            action: 'block',
            source: `[${LOGGING_TAG}]`,
            message: `The parsing of the Ast is not yet fully implemented.\nPlease keep calm, and have a cup of tea, with some biscuits.\nHere is how far we currenlty are:\n\n${newAST}`,
        },
    };
};

export const GetAst: GenericRequestType = {
    method: 'custom-editor/getAST',
    handler:
        (sharedServices: LangiumSharedServices, safeDsServices: SafeDsServices) => (message: AstInterface.Message) =>
            getAstHandler(message, sharedServices, safeDsServices),
};
