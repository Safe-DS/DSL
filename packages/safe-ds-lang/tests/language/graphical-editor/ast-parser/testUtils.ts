import { AstNode, LangiumDocument, URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';

// Use an IIFE to handle the async services initialization
const services = await (async () => {
    const servicesContainer = await createSafeDsServices(NodeFileSystem);
    return servicesContainer.SafeDs;
})();

/**
 * Parses the given code and returns a prepared Parser instance that can be used for testing
 */
export const createParserForTesting = async (code: string): Promise<Parser> => {
    // Parse the code to get a Langium document
    const document = await parseDoc(code);

    // Create a parser instance with minimal setup for testing
    const parser = new Parser(
        document.uri,
        'pipeline',
        services.builtins.Annotations,
        services.workspace.AstNodeLocator,
        services.typing.TypeComputer,
    );

    // Parse the document
    parser.parsePipeline(document);

    return parser;
};

/**
 * Parses code and returns the Langium document
 */
const parseDoc = async (code: string): Promise<LangiumDocument<AstNode>> => {
    const uri = URI.parse('memory://test.sds');
    const document = services.shared.workspace.LangiumDocumentFactory.fromString<AstNode>(code, uri);
    await services.shared.workspace.DocumentBuilder.build([document]);
    return document;
};
