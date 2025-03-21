import { describe, expect, it, vi } from 'vitest';
import { Parameter } from '../../../../src/language/graphical-editor/ast-parser/parameter.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { URI, EmptyFileSystem, AstUtils } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { parseHelper } from 'langium/test';
import { SdsModule, SdsParameter, isSdsParameter } from '../../../../src/language/generated/ast.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';
import { Type } from '../../../../src/language/typing/model.js';

describe('Parameter', () => {
    describe('parse', () => {
        it('should parse a parameter with all properties', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test

                segment TestSegment(const p1: Int = 42) -> result: Float {
                    yield result = p1.toFloat();
                }
            `);

            // Get the parameters from the segment using stream and find
            const root = document.parseResult.value as SdsModule;

            // Find any parameter in the document
            const parameters = AstUtils.streamAllContents(root).filter(isSdsParameter).toArray();

            expect(parameters.length).toBeGreaterThan(0);
            const parameter = parameters.find((p) => p.name === 'p1');

            expect(parameter).toBeDefined();
            expect(parameter?.name).toBe('p1');
            expect(parameter?.isConstant).toBeTruthy();

            const parser = new Parser(
                document.uri,
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Mock computeType to return a type with toString method
            const mockType = {
                isExplicitlyNullable: false,
                isFullySubstituted: true,
                equals: vi.fn(),
                simplify: vi.fn(),
                toString: () => 'Int',
            } as unknown as Type;

            const originalComputeType = parser.computeType;
            vi.spyOn(parser, 'computeType').mockImplementation(() => mockType);

            try {
                // Act
                if (!parameter) {
                    throw new Error('Parameter not found in test setup');
                }

                const result = Parameter.parse(parameter, parser);

                // Make sure result is not an error before testing properties
                expect(result).toBeDefined();
                expect(result).not.toBeInstanceOf(CustomError);

                if (!(result instanceof CustomError)) {
                    expect(result.name).toBe('p1');
                    expect(result.isConstant).toBeTruthy();
                    expect(result.type).toBe('Int');
                    expect(result.defaultValue).toBe('42');
                }
            } finally {
                // Restore original method
                parser.computeType = originalComputeType;
            }
        });

        it('should parse a parameter without default value', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const document = await parseHelper(services)(`
                package test
                
                segment TestSegment(p1: String) -> result: String {
                    yield result = p1;
                }
            `);

            // Get the parameters from the segment using stream and find
            const root = document.parseResult.value as SdsModule;

            // Find any parameter in the document
            const parameters = AstUtils.streamAllContents(root).filter(isSdsParameter).toArray();

            expect(parameters.length).toBeGreaterThan(0);
            const parameter = parameters.find((p) => p.name === 'p1');

            expect(parameter).toBeDefined();
            expect(parameter?.name).toBe('p1');
            expect(parameter?.isConstant).toBeFalsy();

            const parser = new Parser(
                document.uri,
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Mock computeType to return a type with toString method
            const mockType = {
                isExplicitlyNullable: false,
                isFullySubstituted: true,
                equals: vi.fn(),
                simplify: vi.fn(),
                toString: () => 'String',
            } as unknown as Type;

            const originalComputeType = parser.computeType;
            vi.spyOn(parser, 'computeType').mockImplementation(() => mockType);

            try {
                // Act
                if (!parameter) {
                    throw new Error('Parameter not found in test setup');
                }

                const result = Parameter.parse(parameter, parser);

                // Make sure result is not an error before testing properties
                expect(result).toBeDefined();
                expect(result).not.toBeInstanceOf(CustomError);

                if (!(result instanceof CustomError)) {
                    expect(result.name).toBe('p1');
                    expect(result.isConstant).toBeFalsy();
                    expect(result.type).toBe('String');
                    expect(result.defaultValue).toBeUndefined();
                }
            } finally {
                // Restore original method
                parser.computeType = originalComputeType;
            }
        });

        it('should return error for missing type', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            // Create a mock parameter without type
            const mockParameter = {
                $type: 'sds:Parameter',
                name: 'p1',
                isConstant: false,
                // No type property
            } as unknown as SdsParameter;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Mock pushError to return a custom error
            const mockError = new CustomError('block', 'Undefined Type');
            const originalPushError = parser.pushError;
            vi.spyOn(parser, 'pushError').mockImplementation(() => mockError);

            try {
                // Act
                const result = Parameter.parse(mockParameter, parser);

                // Assert
                expect(parser.pushError).toHaveBeenCalledWith('Undefined Type', mockParameter);
                expect(result).toBe(mockError);
            } finally {
                // Restore original method
                parser.pushError = originalPushError;
            }
        });
    });
});
