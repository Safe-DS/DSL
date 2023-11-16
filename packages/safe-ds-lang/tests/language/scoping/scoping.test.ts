import { AssertionError } from 'assert';
import { AstNode, DocumentValidator, getDocument, LangiumDocument, Reference, URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments, isRangeEqual, validationHelper } from 'langium/test';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Location } from 'vscode-languageserver';
import { createSafeDsServices } from '../../../src/language/index.js';
import { isLocationEqual, locationToString } from '../../helpers/location.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { createScopingTests, ExpectedReference } from './creator.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsAnnotationCall, isSdsNamedType, isSdsReference } from '../../../src/language/generated/ast.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const builtinAnnotations = services.builtins.Annotations;
const builtinEnums = services.builtins.Enums;
const builtinClasses = services.builtins.Classes;

describe('scoping', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await createScopingTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        await loadDocuments(services, test.uris);

        // Ensure all expected references match
        for (const expectedReference of test.expectedReferences) {
            const expectedTargetLocation = expectedReference.targetLocation;
            const actualTargetLocation = findActualTargetLocation(expectedReference);

            // Expected reference to be resolved
            if (expectedTargetLocation) {
                if (!actualTargetLocation) {
                    throw new AssertionError({
                        message: `Expected a resolved reference but it was unresolved.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Expected Target Location: ${locationToString(expectedTargetLocation)}`,
                    });
                } else if (!isLocationEqual(expectedTargetLocation, actualTargetLocation)) {
                    throw new AssertionError({
                        message: `Expected a resolved reference but it points to the wrong declaration.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Expected Target Location: ${locationToString(
                            expectedTargetLocation,
                        )}\n    Actual Target Location: ${locationToString(actualTargetLocation)}`,
                        expected: expectedTargetLocation,
                        actual: actualTargetLocation,
                    });
                }
            }

            // Expected reference to be unresolved
            else {
                if (actualTargetLocation) {
                    throw new AssertionError({
                        message: `Expected an unresolved reference but it was resolved.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Actual Target Location: ${locationToString(actualTargetLocation)}`,
                    });
                }
            }
        }
    });

    it('should not replace core declarations (annotation call)', async () => {
        const code = `
            annotation PythonName(name: String)

            @PythonName(name: String)
            segment mySegment() {}
        `;
        const annotationCall = await getNodeOfType(services, code, isSdsAnnotationCall);
        expectSameDocument(annotationCall.annotation?.ref, builtinAnnotations.PythonName);
    });

    it('should not replace core declarations (named type)', async () => {
        const code = `
            class Any

            segment mySegment(p: Any) {}
        `;
        const namedType = await getNodeOfType(services, code, isSdsNamedType);
        expectSameDocument(namedType.declaration?.ref, builtinClasses.Any);
    });

    it('should not replace core declarations (reference)', async () => {
        const code = `
            enum AnnotationTarget

            @Target([AnnotationTarget.Annotation])
            annotation MyAnnotation
        `;
        const reference = await getNodeOfType(services, code, isSdsReference);
        expectSameDocument(reference.target?.ref, builtinEnums.AnnotationTarget);
    });

    it('should resolve members on literals', async () => {
        const code = `
            pipeline myPipeline {
                1.toString();
            }
        `;
        await expectNoLinkingErrors(code);
    });

    it('should resolve members on literal types', async () => {
        const code = `
            segment mySegment(p: literal<"">) {
                p.toString();
            }
        `;
        await expectNoLinkingErrors(code);
    });
});

/**
 * Find the actual target location of the actual reference that matches the expected reference. If the actual reference
 * cannot be resolved, undefined is returned.
 *
 * @param expectedReference The expected reference.
 * @returns The actual target location or undefined if the actual reference is not resolved.
 * @throws AssertionError If no matching actual reference was found.
 */
const findActualTargetLocation = (expectedReference: ExpectedReference): Location | undefined => {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(
        URI.parse(expectedReference.location.uri),
    );

    const actualReference = findActualReference(document, expectedReference);

    const actualTarget = actualReference.$nodeDescription;
    const actualTargetUri = actualTarget?.documentUri?.toString();
    const actualTargetRange = actualTarget?.nameSegment?.range;

    if (!actualTargetUri || !actualTargetRange) {
        return undefined;
    }

    return {
        uri: actualTargetUri,
        range: actualTargetRange,
    };
};

/**
 * Find the reference in the given document that matches the expected reference.
 *
 * @param document The document to search in.
 * @param expectedReference The expected reference.
 * @returns The actual reference.
 * @throws AssertionError If no reference was found.
 */
const findActualReference = (document: LangiumDocument, expectedReference: ExpectedReference): Reference => {
    // Find actual reference
    const actualReference = document.references.find((reference) => {
        const actualReferenceRange = reference.$refNode?.range;
        return actualReferenceRange && isRangeEqual(actualReferenceRange, expectedReference.location.range);
    });

    // Could not find a reference at the expected location
    if (!actualReference) {
        throw new AssertionError({
            message: `Expected a reference but found none.\n    Reference Location: ${locationToString(
                expectedReference.location,
            )}`,
        });
    }
    return actualReference;
};

/**
 * Both nodes should be defined and in the same document or an `AssertionError` is thrown.
 */
const expectSameDocument = (node1: AstNode | undefined, node2: AstNode | undefined): void => {
    if (!node1) {
        throw new AssertionError({ message: `node1 is undefined.` });
    } else if (!node2) {
        throw new AssertionError({ message: `node2 is undefined.` });
    }

    const document1 = getDocument(node1);
    const document2 = getDocument(node2);

    expect(document1.uri.toString()).toStrictEqual(document2.uri.toString());
};

/**
 * The given code should have no linking errors or an `AssertionError` is thrown.
 */
const expectNoLinkingErrors = async (code: string) => {
    const { diagnostics } = await validationHelper(services)(code);
    const linkingError = diagnostics.filter((d) => d.data?.code === DocumentValidator.LinkingError);
    expect(linkingError).toStrictEqual([]);
};
