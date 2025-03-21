import { describe, expect, it, vi } from 'vitest';
import { Expression, GenericExpression } from '../../../../src/language/graphical-editor/ast-parser/expression.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { Call } from '../../../../src/language/graphical-editor/ast-parser/call.js';
import { URI, EmptyFileSystem, AstUtils } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { parseHelper } from 'langium/test';
import { SdsModule, SdsExpression, isSdsCall } from '../../../../src/language/generated/ast.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';
import { Type } from '../../../../src/language/typing/model.js';

describe('GenericExpression', () => {
    describe('constructor', () => {
        it('should create a GenericExpression with given properties', () => {
            // Act
            const id = 42;
            const text = 'test expression';
            const type = 'String';
            const uniquePath = '/test/path';

            const expression = new GenericExpression(id, text, type, uniquePath);

            // Assert
            expect(expression.id).toBe(id);
            expect(expression.text).toBe(text);
            expect(expression.type).toBe(type);
            expect(expression.uniquePath).toBe(uniquePath);
        });
    });

    describe('parse', () => {
        it('should parse a GenericExpression and add it to parser graph', async () => {
            // Arrange
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test;
                
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

            // Mock parser methods
            const mockId = 42;
            const getNewIdSpy = vi.spyOn(parser, 'getNewId').mockImplementation(() => mockId);

            // Mock computeType to return a type
            const mockType = {
                isExplicitlyNullable: false,
                isFullySubstituted: true,
                equals: vi.fn(),
                simplify: vi.fn(),
                toString: () => 'Int',
            } as unknown as Type;

            const computeTypeSpy = vi.spyOn(parser, 'computeType').mockImplementation(() => mockType);
            const getUniquePathSpy = vi.spyOn(parser, 'getUniquePath').mockImplementation(() => '/test/path');

            // Create mock expression with CST node
            const mockExpression = {
                $type: 'SdsLiteralExpression',
                $cstNode: { text: '42' },
            } as unknown as SdsExpression;

            try {
                // Act
                const result = Expression.parse(mockExpression, parser);

                // Assert
                expect(result).toBeInstanceOf(GenericExpression);
                expect(getNewIdSpy).toHaveBeenCalledWith();
                expect(computeTypeSpy).toHaveBeenCalledWith(mockExpression);
                expect(getUniquePathSpy).toHaveBeenCalledWith(mockExpression);
                expect(parser.graph.genericExpressionList).toContain(result);

                if (result instanceof GenericExpression) {
                    expect(result.id).toBe(mockId);
                    expect(result.text).toBe('42');
                    expect(result.type).toBe('Int');
                    expect(result.uniquePath).toBe('/test/path');
                }
            } finally {
                // Restore original methods
                vi.restoreAllMocks();
            }
        });

        it('should return error for missing CST node', async () => {
            // Arrange
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Mock parser.pushError to track error
            const mockError = new CustomError('block', 'Missing CstNode');
            const originalPushError = parser.pushError;
            const pushErrorSpy = vi.spyOn(parser, 'pushError').mockImplementation(() => mockError);

            // Create a mock expression without CST node
            const expressionNode = {
                $type: 'SdsLiteralExpression',
                // No $cstNode
            } as unknown as SdsExpression;

            try {
                // Act
                const result = Expression.parse(expressionNode, parser);

                // Assert
                expect(pushErrorSpy).toHaveBeenCalledWith('Missing CstNode', expressionNode);
                expect(result).toBe(mockError);
            } finally {
                // Restore original method
                parser.pushError = originalPushError;
            }
        });
    });
});

describe('Expression', () => {
    describe('parse', () => {
        it('should delegate to Call.parse for call expressions', async () => {
            // Arrange
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test
                
                segment TestSegment() -> result: Int {
                    yield result = testFunction();
                }
                
                segment testFunction() -> result: Int {
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

            // Find a call expression in the document
            const root = document.parseResult.value as SdsModule;
            const callNodes = AstUtils.streamAllContents(root).filter(isSdsCall).toArray();

            expect(callNodes.length).toBeGreaterThan(0);
            const callNode = callNodes[0];

            // Mock Call.parse with a mock instance that has Call's interface
            const mockCallResult = {
                id: 42,
                name: 'testFunction',
                self: undefined,
                parameterList: [],
                resultList: [],
                category: 'function',
                uniquePath: '/test/path',
            };

            const originalCallParse = Call.parse;
            Call.parse = vi.fn() as typeof Call.parse;
            vi.mocked(Call.parse).mockReturnValue(mockCallResult);

            try {
                // Act
                if (!callNode) {
                    throw new Error('Call node not found in test setup');
                }

                const result = Expression.parse(callNode, parser);

                // Assert
                expect(Call.parse).toHaveBeenCalledWith(callNode, parser);
                expect(result).toBe(mockCallResult);
            } finally {
                // Restore original Call.parse
                Call.parse = originalCallParse;
            }
        });

        it('should create GenericExpression for non-call expressions', async () => {
            // Arrange
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

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

            // Create a mock literal expression directly instead of finding one
            const mockLiteralExpr = {
                $type: 'sds:LiteralExpression',
                $cstNode: { text: '42' },
                value: '42',
            } as unknown as SdsExpression;

            // Mock methods
            const mockId = 42;
            vi.spyOn(parser, 'getNewId').mockImplementation(() => mockId);

            const mockType = {
                isExplicitlyNullable: false,
                isFullySubstituted: true,
                equals: vi.fn(),
                simplify: vi.fn(),
                toString: () => 'Int',
            } as unknown as Type;

            vi.spyOn(parser, 'computeType').mockImplementation(() => mockType);
            vi.spyOn(parser, 'getUniquePath').mockImplementation(() => '/test/path');

            try {
                // Act
                const result = Expression.parse(mockLiteralExpr, parser);

                // Assert
                expect(result).toBeInstanceOf(GenericExpression);

                if (result instanceof GenericExpression) {
                    expect(result.id).toBe(mockId);
                    expect(result.type).toBe('Int');
                }
            } finally {
                // Restore mocks
                vi.restoreAllMocks();
            }
        });
    });
});
