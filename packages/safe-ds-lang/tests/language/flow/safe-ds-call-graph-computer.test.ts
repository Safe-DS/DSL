import { describe, expect, it } from 'vitest';
import { EmptyFileSystem, isNamed } from 'langium';
import { isSdsBlockLambda, isSdsExpressionLambda, isSdsModule, SdsCall } from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { createCallGraphTests } from './creator.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isRangeEqual } from 'langium/test';
import { locationToString } from '../../helpers/location.js';
import { AssertionError } from 'assert';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const callGraphComputer = services.flow.CallGraphComputer;

describe('SafeDsCallGraphComputer', () => {
    describe('getCallGraph', async () => {
        it.each(await createCallGraphTests())('$testName', async (test) => {
            // Test is invalid
            if (test.error) {
                throw test.error;
            }

            const module = await getNodeOfType(services, test.code, isSdsModule);

            for (const { location, expectedCallables } of test.expectedCallGraphs) {
                const node = callGraphComputer
                    .getCalls(module)
                    .find((call) => isRangeEqual(call.$cstNode!.range, location.range));
                if (!node) {
                    throw new Error(`Could not find call at ${locationToString(location)}`);
                }

                const actualCallables = getActualCallables(node);
                try {
                    expect(actualCallables).toStrictEqual(expectedCallables);
                } catch (e) {
                    throw new AssertionError({
                        message: `Got wrong callables at ${locationToString(
                            location,
                        )}.\nExpected: [${expectedCallables.join(', ')}]\nActual: [${actualCallables.join(', ')}]`,
                        expected: expectedCallables,
                        actual: actualCallables,
                    });
                }
            }
        });
    });
});

const getActualCallables = (node: SdsCall): string[] => {
    return callGraphComputer
        .getCallGraph(node)
        .streamCalledCallables()
        .map((callable) => {
            if (callable && isNamed(callable)) {
                return callable.name;
            } else if (isSdsBlockLambda(callable)) {
                return '$blockLambda';
            } else if (isSdsExpressionLambda(callable)) {
                return '$expressionLambda';
            } else {
                return 'undefined';
            }
        })
        .toArray();
};
