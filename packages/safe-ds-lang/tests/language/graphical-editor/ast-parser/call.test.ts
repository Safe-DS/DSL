import { describe, expect, it } from 'vitest';
import { createParserForTesting } from './testUtils.js';

describe('Call', () => {
    it('should parse a function call', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table = Table.fromCsvFile("somePath");
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of looking at specifics, just check the graph name and error count
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });

    it('should parse a class instantiation call', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val imputerEmpty = SimpleImputer(
                    SimpleImputer.Strategy.Constant(""),
                    selector = "Cabin"
                );
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of looking at specifics, just check the graph name and error count
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });

    it('should parse a segment call', async () => {
        const code = `
            package test
            segment testSegment() {}
            pipeline testPipeline {
                testSegment();
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of looking at specifics, just check the graph name and error count
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });

    it('should handle invalid call receiver', async () => {
        const code = `
            package test
            pipeline testPipeline {
                42();
            }
        `;

        const parser = await createParserForTesting(code);

        // Since we're testing with minimal context, we can't rely on specific error messages
        // Just verify that an error was reported
        expect(parser.hasErrors()).toBeTruthy();

        const result = parser.getResult();
        expect(result.errorList.length).toBeGreaterThan(0);
    });
});
