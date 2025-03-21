import { describe, expect, it } from 'vitest';
import { Edge, Port } from '../../../../src/language/graphical-editor/ast-parser/edge.js';
import { Result } from '../../../../src/language/graphical-editor/ast-parser/result.js';
import { Parameter } from '../../../../src/language/graphical-editor/ast-parser/parameter.js';
import { Placeholder } from '../../../../src/language/graphical-editor/ast-parser/placeholder.js';
import { GenericExpression } from '../../../../src/language/graphical-editor/ast-parser/expression.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { URI, EmptyFileSystem } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';
import { SdsParameter, SdsPlaceholder } from '../../../../src/language/generated/ast.js';

// Mock objects for testing
const mockPlaceholder = (name: string): SdsPlaceholder =>
    ({
        $type: 'sds:Placeholder',
        name,
        type: { $type: 'sds:NamedType', declaration: { $refText: 'String' } },
    }) as unknown as SdsPlaceholder;

const mockParameter = (name: string): SdsParameter =>
    ({
        $type: 'sds:Parameter',
        name,
        isConstant: false,
        type: { $type: 'sds:NamedType', declaration: { $refText: 'Int' } },
    }) as unknown as SdsParameter;

describe('Edge', () => {
    describe('constructor', () => {
        it('should create an edge with from and to ports', () => {
            const fromPort = Port.fromName(1, 'source');
            const toPort = Port.fromName(2, 'target');

            const edge = new Edge(fromPort, toPort);

            expect(edge.from).toBe(fromPort);
            expect(edge.to).toBe(toPort);
        });
    });

    describe('create', () => {
        it('should add edge to parser graph', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            const fromPort = Port.fromName(1, 'source');
            const toPort = Port.fromName(2, 'target');

            expect(parser.graph.edgeList).toHaveLength(0);

            Edge.create(fromPort, toPort, parser);

            expect(parser.graph.edgeList).toHaveLength(1);
            expect(parser.graph.edgeList[0]!.from).toBe(fromPort);
            expect(parser.graph.edgeList[0]!.to).toBe(toPort);
        });
    });
});

describe('Port', () => {
    describe('fromName', () => {
        it('should create a port from node ID and name', () => {
            const port = Port.fromName(123, 'testPort');

            expect(port.nodeId).toBe('123');
            expect(port.portIdentifier).toBe('testPort');
        });
    });

    describe('fromPlaceholder', () => {
        it('should create a port from a placeholder (input=true)', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Add a mock computing type method to parser
            parser.computeType = (() => ({ toString: () => 'String' })) as any as typeof parser.computeType;
            parser.getUniquePath = () => '/test/path';

            const placeholder = Placeholder.parse(mockPlaceholder('placeholderName'), parser);
            const port = Port.fromPlaceholder(placeholder, true);

            expect(port.nodeId).toBe('placeholderName');
            expect(port.portIdentifier).toBe('target');
        });

        it('should create a port from a placeholder (input=false)', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Add a mock computing type method to parser
            parser.computeType = (() => ({ toString: () => 'String' })) as any as typeof parser.computeType;
            parser.getUniquePath = () => '/test/path';

            const placeholder = Placeholder.parse(mockPlaceholder('placeholderName'), parser);
            const port = Port.fromPlaceholder(placeholder, false);

            expect(port.nodeId).toBe('placeholderName');
            expect(port.portIdentifier).toBe('source');
        });
    });

    describe('fromResult', () => {
        it('should create a port from a result', () => {
            const result = new Result('resultName', 'resultType');
            const port = Port.fromResult(result, 456);

            expect(port.nodeId).toBe('456');
            expect(port.portIdentifier).toBe('resultName');
        });
    });

    describe('fromParameter', () => {
        it('should create a port from a parameter', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Add a mock computing type method to parser
            parser.computeType = (() => ({ toString: () => 'Int' })) as any as typeof parser.computeType;
            parser.getUniquePath = () => '/test/path';

            const parameter = Parameter.parse(mockParameter('paramName'), parser);
            if (parameter instanceof CustomError) {
                throw new Error('Parameter parsing failed');
            }

            const port = Port.fromParameter(parameter, 789);

            expect(port.nodeId).toBe('789');
            expect(port.portIdentifier).toBe('paramName');
        });
    });

    describe('fromGenericExpression', () => {
        it('should create a port from a generic expression (input=true)', () => {
            const expression = new GenericExpression(42, 'text', 'exprType', 'path');
            const port = Port.fromGenericExpression(expression, true);

            expect(port.nodeId).toBe('42');
            expect(port.portIdentifier).toBe('target');
        });

        it('should create a port from a generic expression (input=false)', () => {
            const expression = new GenericExpression(42, 'text', 'exprType', 'path');
            const port = Port.fromGenericExpression(expression, false);

            expect(port.nodeId).toBe('42');
            expect(port.portIdentifier).toBe('source');
        });
    });

    describe('fromAssignee', () => {
        it('should create a port from a placeholder assignee', async () => {
            const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

            const parser = new Parser(
                URI.parse('file:///test.sds'),
                'pipeline',
                services.builtins.Annotations,
                services.workspace.AstNodeLocator,
                services.typing.TypeComputer,
            );

            // Add a mock computing type method to parser
            parser.computeType = (() => ({ toString: () => 'String' })) as any as typeof parser.computeType;
            parser.getUniquePath = () => '/test/path';

            const placeholder = Placeholder.parse(mockPlaceholder('assigneeName'), parser);
            const port = Port.fromAssignee(placeholder, true);

            expect(port.nodeId).toBe('assigneeName');
            expect(port.portIdentifier).toBe('target');
        });

        it('should create a port from a result assignee', () => {
            const result = new Result('assigneeResult', 'assigneeType');
            const port = Port.fromAssignee(result, true);

            expect(port.nodeId).toBe('-1');
            expect(port.portIdentifier).toBe('assigneeResult');
        });
    });

    describe('isPortList', () => {
        it('should return true for an array of ports', () => {
            const port1 = Port.fromName(1, 'port1');
            const port2 = Port.fromName(2, 'port2');
            const portList = [port1, port2];

            expect(Port.isPortList(portList)).toBeTruthy();
        });

        it('should return false for non-port arrays', () => {
            const notPortList = [1, 2, 3];

            expect(Port.isPortList(notPortList)).toBeFalsy();
        });

        it('should return false for non-arrays', () => {
            const notArray = { name: 'notArray' };

            expect(Port.isPortList(notArray)).toBeFalsy();
        });
    });
});
