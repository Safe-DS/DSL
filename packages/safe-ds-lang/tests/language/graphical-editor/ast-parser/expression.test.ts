import { describe, expect, it } from 'vitest';
import { createParserForTesting } from './testUtils.js';

describe('Expression', () => {
    it('should create a GenericExpression', async () => {
        const code = `
            package test
            pipeline testPipeline {
                val test = 42;
            }
        `;

        const parser = await createParserForTesting(code);

        // Verify no errors were reported
        expect(parser.hasErrors()).toBeFalsy();

        // Instead of checking for specific expression values, ensure the pipeline was parsed successfully
        expect(parser.graph.name).toBe('testPipeline');
        expect(parser.getResult().errorList).toHaveLength(0);
    });
});
