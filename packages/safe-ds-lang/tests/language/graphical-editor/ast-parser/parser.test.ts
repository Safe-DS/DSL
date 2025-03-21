import { describe, expect, it } from 'vitest';
import { createParserForTesting } from './testUtils.js';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { URI } from 'langium';

// Use an IIFE to handle the async services initialization
const services = await (async () => {
    const servicesContainer = await createSafeDsServices(NodeFileSystem);
    return servicesContainer.SafeDs;
})();

describe('Parser', () => {
    it('should initialize with correct properties', () => {
        const uri = URI.parse('memory://test.sds');
        const parser = new Parser(
            uri,
            'pipeline',
            services.builtins.Annotations,
            services.workspace.AstNodeLocator,
            services.typing.TypeComputer,
        );

        expect(parser).toBeDefined();
        expect(parser.graph).toBeDefined();
        expect(parser.graph.type).toBe('pipeline');
        expect(parser.hasErrors()).toBeFalsy();
    });

    it('should parse pipelines correctly', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table = Table(
                    {
                        "a": [1, 2, 3, 4, 5],
                        "b": [6, 7, 8, 9, 10]
                    }
                );
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors
        expect(parser.hasErrors()).toBeFalsy();

        // Check graph properties
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.graph.callList.length).toBeGreaterThan(0);
    });

    it('should handle and report errors', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table;
                val x = undefinedFunction();
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify errors are reported
        expect(parser.hasErrors()).toBeTruthy();

        const result = parser.getResult();
        expect(result.errorList.length).toBeGreaterThan(0);
    });

    it('should construct proper error messages', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table;
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify errors are reported
        expect(parser.hasErrors()).toBeTruthy();

        const result = parser.getResult();
        expect(result.errorList[0]?.message).toContain('Expression missing');
    });

    it('should create a complete graph representation', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table = Table(
                    {
                        "a": [1, 2, 3, 4, 5],
                        "b": [6, 7, 8, 9, 10]
                    }
                );
                val test, val train = table.splitRows(0.6);
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify graph structure
        expect(parser.graph).toBeDefined();
        expect(parser.graph.callList.length).toBeGreaterThan(1); // At least Table and splitRows
        expect(parser.graph.edgeList.length).toBeGreaterThan(0); // Should have edges connecting nodes
        expect(parser.graph.name).toBe('testPipeline');
    });
});
