import { describe, expect, it } from 'vitest';
import { CallGraph } from '../../../src/language/flow/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { EmptyFileSystem } from 'langium';
import { isSdsModule, SdsCallable } from '../../../src/language/generated/ast.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const code = `
    fun f1()
    fun f2()
    fun f3()
`;

const module = await getNodeOfType(services, code, isSdsModule);
const f1 = module.members[0] as SdsCallable;
const f2 = module.members[1] as SdsCallable;
const f3 = module.members[2] as SdsCallable;

describe('call graph model', () => {
    describe('streamCalledCallables', () => {
        it.each([
            {
                graph: new CallGraph(undefined, []),
                expected: [undefined],
            },
            {
                graph: new CallGraph(f1, []),
                expected: [f1],
            },
            {
                graph: new CallGraph(f1, [new CallGraph(f2, [])]),
                expected: [f1, f2],
            },
            {
                graph: new CallGraph(f1, [new CallGraph(f2, [new CallGraph(f3, [])])]),
                expected: [f1, f2, f3],
            },
            {
                graph: new CallGraph(f1, [new CallGraph(f2, [new CallGraph(f3, [])]), new CallGraph(f1, [])]),
                expected: [f1, f2, f3, f1],
            },
        ])('should traverse the call graph depth-first in pre-order #%#', ({ graph, expected }) => {
            expect(graph.streamCalledCallables().toArray()).toStrictEqual(expected);
        });
    });
});
