import { Location, Range } from 'vscode-languageserver';
import { isRangeEqual, parseHelper } from 'langium/test';
import { SafeDsServices } from '../../src/language/index.js';
import { AstNode, AstUtils, URI } from 'langium';
import { SdsModule } from '../../src/language/generated/ast.js';
import { AssertionError } from 'assert';
import { locationToString } from '../../src/helpers/locations.js';

/**
 * Find the AstNode at the given location. It must either fill the entire range or have a name node that does.
 *
 * @param services The services to use.
 * @param location The location of the node to find.
 * @returns The node at the given location.
 * @throws AssertionError If no matching node was found.
 */
export const getNodeByLocation = (services: SafeDsServices, location: Location): AstNode => {
    const langiumDocuments = services.shared.workspace.LangiumDocuments;
    const uri = URI.parse(location.uri);

    const document = langiumDocuments.getDocument(uri);
    if (!document) {
        throw new AssertionError({
            message: `No document found at ${location.uri}`,
        });
    }

    const module = document.parseResult.value as SdsModule;

    for (const node of AstUtils.streamAllContents(module)) {
        // Entire node matches the range
        const actualRange = node.$cstNode?.range;
        if (actualRange && isRangeEqual(actualRange, location.range)) {
            return node;
        }

        // The node has a name node that matches the range
        const actualNameRange = getNameRange(services, node);
        if (actualNameRange && isRangeEqual(actualNameRange, location.range)) {
            return node;
        }
    }

    throw new AssertionError({ message: `Expected to find a node at ${locationToString(location)} but found none.` });
};

/**
 * Returns the range of the name of the given node or undefined if the node has no name.
 */
const getNameRange = (services: SafeDsServices, node: AstNode): Range | undefined => {
    return services.references.NameProvider.getNameNode(node)?.range;
};

/**
 * Find the nth node that matches the given predicate in the code.
 *
 * @param services The services to use.
 * @param code The code to parse.
 * @param predicate The predicate to match.
 * @param index The index of the node to find.
 */
export const getNodeOfType = async <T extends AstNode>(
    services: SafeDsServices,
    code: string,
    predicate: (value: unknown) => value is T,
    index: number = 0,
): Promise<T> => {
    const document = await parseHelper(services)(code);
    const module = document.parseResult.value as SdsModule;
    const candidates = AstUtils.streamAst(module).filter(predicate).toArray();

    if (candidates.length === 0) {
        throw new AssertionError({ message: `Expected to find a matching node but found none.` });
    } else if (candidates.length <= index) {
        throw new AssertionError({
            message: `Expected to find a matching node at index ${index} but found only ${candidates.length}.`,
        });
    }

    return candidates[index]!;
};
