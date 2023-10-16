import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import {
    isSdsAbstractResult,
    isSdsAssignment,
    isSdsPlaceholder,
    SdsAssignee,
} from '../../../../src/language/generated/ast.js';
import { assigneesOrEmpty } from '../../../../src/language/helpers/nodeProperties.js';
import { NodeFileSystem } from 'langium/node';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('assigneeToAssignedObjectOrUndefined', () => {
        it('should return undefined if passed undefined', async () => {
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(undefined)?.$type).toBeUndefined();
        });

        it.each([
            {
                name: 'no value',
                code: `
                    fun f()

                    segment mySegment() {
                        val a = f();
                    };
                `,
            },
            {
                name: 'only one value',
                code: `
                    segment mySegment() {
                        _, val a = 1;
                    };
                `,
            },

            {
                name: 'unresolved receiver of call',
                code: `
                    segment mySegment() {
                        val a = unresolved();
                    };
                `,
            },
        ])('should return undefined if nothing is assigned ($name)', async ({ code }) => {
            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(placeholder)?.$type).toBeUndefined();
        });

        it('should return the entire RHS of an assignment if it is not a call (constant)', async () => {
            const code = `
                segment mySegment() {
                    val a = 1;
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(placeholder)?.$type).toBe('SdsInt');
        });

        it('should return the entire RHS of an assignment if it is a call of a class', async () => {
            const code = `
                class C
                segment mySegment() {
                    val a = C();
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(placeholder)?.$type).toBe('SdsCall');
        });

        it('should return the entire RHS of an assignment if it is a call of an enum variant', async () => {
            const code = `
                enum E {
                    V
                }
                segment mySegment() {
                    val a = E.V();
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(placeholder)?.$type).toBe('SdsCall');
        });

        it('should return the entire RHS of an assignment if it is not a call (unresolved reference)', async () => {
            const code = `
                segment mySegment() {
                    val a = unresolved;
                };
            `;

            const placeholder = await getNodeOfType(services, code, isSdsPlaceholder);
            expect(nodeMapper.assigneeToAssignedObjectOrUndefined(placeholder)?.$type).toBe('SdsReference');
        });

        it.each([
            {
                name: 'block lambda',
                code: `
                    segment mySegment() {
                        val f = () {
                            yield r1 = 1;
                            yield r2 = 2;
                        };

                        val a, val b = f();
                    };
                `,
                expected: ['r1', 'r2'],
                index: 3,
            },
            {
                name: 'callable type',
                code: `
                    segment mySegment(f: () -> (r1: Int, r2: Int)) {
                        val a, val b = f();
                    };
                `,
                expected: ['r1', 'r2'],
            },
            {
                name: 'function (one result)',
                code: `
                    fun f() -> (r1: Int)

                    segment mySegment() {
                        val a = f();
                    };
                `,
                expected: ['r1'],
            },
            {
                name: 'function (multiple results)',
                code: `
                    fun f() -> (r1: Int, r2: Int)

                    segment mySegment() {
                        val a, val b = f();
                    };
                `,
                expected: ['r1', 'r2'],
            },
            {
                name: 'segment',
                code: `
                    segment s() -> (r1: Int, r2: Int)

                    segment mySegment() {
                        val a, val b = s();
                    };
                `,
                expected: ['r1', 'r2'],
            },
        ])(
            'should return the corresponding result if the RHS is a call of a $name',
            async ({ code, expected, index = 0 }) => {
                const assignment = await getNodeOfType(services, code, isSdsAssignment, index);
                const abstractResultNames = assigneesOrEmpty(assignment).map(abstractResultNameOrNull);
                expect(abstractResultNames).toStrictEqual(expected);
            },
        );

        const abstractResultNameOrNull = (node: SdsAssignee): string | undefined => {
            const assignedObject = nodeMapper.assigneeToAssignedObjectOrUndefined(node);
            if (isSdsAbstractResult(assignedObject)) {
                return assignedObject.name;
            } else {
                return undefined;
            }
        };
    });
});
