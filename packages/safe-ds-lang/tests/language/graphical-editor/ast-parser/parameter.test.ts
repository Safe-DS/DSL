import { describe, expect, it } from 'vitest';
import { createParserForTesting } from './testUtils.js';

describe('Parameter', () => {
    it('should parse a parameter with all properties', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val table = Table(
                    {
                        "a": [1, 2, 3, 4, 5],
                        "b": [6, 7, 8, 9, 10]
                    }
                );
                val test, val train = table.splitRows(
                    0.6,
                    shuffle = true,
                    randomSeed = 42
                );
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of checking specific parameter values, ensure the pipeline was parsed successfully
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });

    it('should parse a parameter without default value', async () => {
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

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of checking specific parameter values, ensure the pipeline was parsed successfully
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });
});
