import { describe, expect, it } from 'vitest';
import { isNamed, streamAst } from 'langium';
import {
    isSdsBlockLambda,
    isSdsCall,
    isSdsCallable,
    isSdsExpressionLambda,
    isSdsModule,
    SdsCall,
    SdsCallable,
} from '../../../src/language/generated/ast.js';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { createCallGraphTests } from './creator.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isRangeEqual } from 'langium/test';
import { locationToString } from '../../helpers/location.js';
import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
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
                const node = streamAst(module).find((call) => isRangeEqual(call.$cstNode!.range, location.range));
                if (!node || (!isSdsCall(node) && !isSdsCallable(node))) {
                    throw new Error(`Could not find call/callable at ${locationToString(location)}`);
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

const getActualCallables = (node: SdsCall | SdsCallable): string[] => {
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
