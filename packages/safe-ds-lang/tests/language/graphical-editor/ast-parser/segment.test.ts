import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { Parser } from '../../../../src/language/graphical-editor/ast-parser/parser.js';
import { URI } from 'langium';

// Use an IIFE to handle the async services initialization
const services = await (async () => {
    const servicesContainer = await createSafeDsServices(NodeFileSystem);
    return servicesContainer.SafeDs;
})();

describe('Segment', () => {
    it('should parse a segment with parameters and results', async () => {
        const code = `
            package test
            segment testSegment(path: String) -> (dataset: Table) {
                yield dataset = Table.fromCsvFile(path);
            }
            pipeline testPipeline {
                val dataset = testSegment("./somePath");
            }
        `;

        const document = await parseDoc(code);
        const segmentResult = Parser.parseSegments(
            document,
            services.builtins.Annotations,
            services.workspace.AstNodeLocator,
            services.typing.TypeComputer,
        );

        // Verify we have one segment
        expect(segmentResult.segmentList).toHaveLength(1);

        // Verify no errors were reported
        expect(segmentResult.errorList).toHaveLength(0);
    });

    it('should handle empty segments', async () => {
        const code = `
            package test
            segment testSegment() {}
            pipeline testPipeline {
                testSegment();
            }
        `;

        const document = await parseDoc(code);
        const segmentResult = Parser.parseSegments(
            document,
            services.builtins.Annotations,
            services.workspace.AstNodeLocator,
            services.typing.TypeComputer,
        );

        // Verify we have one segment
        expect(segmentResult.segmentList).toHaveLength(1);

        // Verify no errors were reported
        expect(segmentResult.errorList).toHaveLength(0);
    });
});

// Helper to parse code and get a document
const parseDoc = async (code: string) => {
    const uri = URI.parse('memory://test.sds');
    const document = services.shared.workspace.LangiumDocumentFactory.fromString(code, uri);
    await services.shared.workspace.DocumentBuilder.build([document]);
    return document;
};
