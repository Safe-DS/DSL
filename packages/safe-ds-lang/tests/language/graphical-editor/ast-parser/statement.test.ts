import { describe, expect, it, vi } from 'vitest';
import { Statement } from '../../../../src/language/graphical-editor/ast-parser/statement.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { EmptyFileSystem, AstUtils } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { parseHelper } from 'langium/test';
import { SdsModule, isSdsAssignment, isSdsExpressionStatement } from '../../../../src/language/generated/ast.js';
import { Expression } from '../../../../src/language/graphical-editor/ast-parser/expression.js';
import { URI } from 'vscode-uri';

describe('Statement', () => {
    describe('parse', () => {
        it('should parse an expression statement in a pipeline', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test
                
                pipeline TestPipeline {
                    42;
                }
            `);

            const parser = new Parser(
                document.uri,
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const root = document.parseResult.value as SdsModule;
            const statements = AstUtils.streamAllContents(root).filter(isSdsExpressionStatement).toArray();

            expect(statements.length).toBeGreaterThan(0);
            const statement = statements[0];
            expect(statement).toBeDefined();

            const originalExpressionParse = Expression.parse;
            const mockExpressionResult = { id: 42, type: 'Int', text: '42', uniquePath: '/test/path' };
            Expression.parse = vi.fn() as typeof Expression.parse;
            vi.mocked(Expression.parse).mockReturnValue(mockExpressionResult);

            try {
                if (!statement) {
                    throw new Error('Expression statement not found in test setup');
                }

                Statement.parse(statement, parser);

                expect(Expression.parse).toHaveBeenCalledWith(statement.expression, parser);
            } finally {
                Expression.parse = originalExpressionParse;
            }
        });

        it('should parse an assignment statement', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test
                
                segment TestSegment() -> result: Int {
                    val x = 42;
                    yield result = x;
                }
            `);

            const parser = new Parser(
                document.uri,
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const root = document.parseResult.value as SdsModule;
            const assignments = AstUtils.streamAllContents(root).filter(isSdsAssignment).toArray();

            expect(assignments.length).toBeGreaterThan(0);
            const assignment = assignments[0];
            expect(assignment).toBeDefined();

            const originalExpressionParse = Expression.parse;
            const mockExpressionResult = { id: 42, type: 'Int', text: '42', uniquePath: '/test/path' };
            Expression.parse = vi.fn() as typeof Expression.parse;
            vi.mocked(Expression.parse).mockReturnValue(mockExpressionResult);

            try {
                if (!assignment) {
                    throw new Error('Assignment not found in test setup');
                }

                Statement.parse(assignment, parser);

                expect(Expression.parse).toHaveBeenCalledWith(assignment.expression, parser);
            } finally {
                Expression.parse = originalExpressionParse;
            }
        });

        it('should report error for missing expression in assignment', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Create a mock assignment with no expression
            const mockAssignment = {
                $type: 'sds:Assignment',
                assigneeList: {
                    assignees: [
                        {
                            $type: 'sds:Reference',
                            ref: { $refText: 'x' },
                        },
                    ],
                },
                // No expression property
            };

            // Spy on pushError method
            const pushErrorSpy = vi.spyOn(parser, 'pushError');

            // Process the mock assignment
            Statement.parse(mockAssignment as any, parser);

            // Verify that pushError was called with 'Expression missing'
            expect(pushErrorSpy).toHaveBeenCalledWith('Expression missing', mockAssignment);
        });

        it('should report error for missing assignees in assignment', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            // Create a document with an invalid assignment (empty assignee list)
            // This is harder to create with valid syntax, so we'll use a different approach
            const document = await parseHelper(services)(`
                package test
                
                segment TestSegment() -> result: Int {
                    yield result = 42;
                }
            `);

            const parser = new Parser(
                document.uri,
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Create an assignment with an empty assignee list
            const mockAssignment = {
                $type: 'sds:Assignment',
                assigneeList: { assignees: [] },
                expression: { $type: 'sds:LiteralExpression', value: '42' },
            };

            // Spy on pushError method
            const pushErrorSpy = vi.spyOn(parser, 'pushError');

            // Process the mock assignment
            Statement.parse(mockAssignment as any, parser);

            // Verify that pushError was called with 'Assignee(s) missing'
            expect(pushErrorSpy).toHaveBeenCalledWith('Assignee(s) missing', mockAssignment);
        });
    });
});
