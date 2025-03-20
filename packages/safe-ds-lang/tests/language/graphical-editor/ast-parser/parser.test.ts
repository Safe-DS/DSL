import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { EmptyFileSystem, URI } from 'langium';
import { clearDocuments, parseHelper } from 'langium/test';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';
import { ILexingError, IRecognitionException } from 'chevrotain';

describe('Parser', async () => {
    const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            expect(parser.graph).toBeDefined();
            expect(parser.graph.type).toBe('pipeline');
            expect(parser.hasErrors()).toBeFalsy();
        });

        it('should initialize with custom lastId', () => {
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'segment',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
                undefined,
                100,
            );

            expect(parser.getNewId()).toBe(100);
            expect(parser.getNewId()).toBe(101);
        });
    });

    describe('getNewId', () => {
        it('should increment and return ID', () => {
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const firstId = parser.getNewId();
            const secondId = parser.getNewId();

            expect(secondId).toBe(firstId + 1);
        });
    });

    describe('error handling', () => {
        it('should track errors through pushError', () => {
            const mockLogger = { error: vi.fn() };
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
                mockLogger as any,
            );

            expect(parser.hasErrors()).toBeFalsy();

            parser.pushError('Test error');

            expect(parser.hasErrors()).toBeTruthy();
            expect(mockLogger.error).toHaveBeenCalledWith('Test error');

            const { errorList } = parser.getResult();
            expect(errorList).toHaveLength(1);
            expect(errorList[0]!).toBeInstanceOf(CustomError);
            expect(errorList[0]!.message).toContain('Test error');
        });

        it('should push lexer errors', () => {
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const lexerError: ILexingError = {
                message: 'Lexer error',
                line: 1,
                column: 5,
                length: 1,
                offset: 10,
            };
            parser.pushLexerErrors(lexerError);

            expect(parser.hasErrors()).toBeTruthy();
            const { errorList } = parser.getResult();
            expect(errorList[0]!.message).toContain('Lexer Error');
            expect(errorList[0]!.message).toContain('2:6'); // 1-indexed
        });

        it('should push parser errors', () => {
            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const parserError = {
                message: 'Parser error',
                token: { startLine: 2, startColumn: 10 },
            } as IRecognitionException;

            parser.pushParserErrors(parserError);

            expect(parser.hasErrors()).toBeTruthy();
            const { errorList } = parser.getResult();
            expect(errorList[0]!.message).toContain('Parser Error');
            expect(errorList[0]!.message).toContain('3:11'); // 1-indexed
        });
    });

    describe('parsePipeline', () => {
        it('should report error when no pipeline is defined', async () => {
            const document = await parseHelper(services)(`
                package test
                class Test {}
            `);

            const parser = new Parser(
                document.uri,
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            parser.parsePipeline(document);

            expect(parser.hasErrors()).toBeTruthy();
            const { errorList } = parser.getResult();
            expect(errorList[0]!.message).toContain('Pipeline must be defined exactly once');
        });

        it('should parse a simple pipeline', async () => {
            const document = await parseHelper(services)(`
                package test
                pipeline MyPipeline {
                    // Empty pipeline
                }
            `);

            const parser = new Parser(
                document.uri,
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            parser.parsePipeline(document);

            expect(parser.hasErrors()).toBeFalsy();
            const { graph } = parser.getResult();
            expect(graph.name).toBe('MyPipeline');
        });
    });

    describe('parseSegments', () => {
        it('should parse segments from document', async () => {
            const document = await parseHelper(services)(`
                package test
                segment TestSegment(input: Int) -> output: Int {
                    output = input * 2
                }
            `);

            const result = Parser.parseSegments(
                document,
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            expect(result.errorList).toHaveLength(0);
            expect(result.segmentList).toHaveLength(1);

            const segmentName = result.segmentList[0]!.name;
            expect(segmentName.includes('TestSegment') || segmentName === '/members@0').toBeTruthy();

            expect(result.segmentList[0]!.parameterList).toHaveLength(1);
            expect(result.segmentList[0]!.resultList).toHaveLength(1);
        });
    });
});
