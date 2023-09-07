import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { clearDocuments, expectFormatting } from 'langium/test';
import { describe, it } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { createFormattingTests } from './creator.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const formatterTests = createFormattingTests();

describe('formatter', async () => {
    // Test that the original code is formatted correctly
    it.each(await formatterTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Formatting original code must result in expected formatted code
        await expectFormatting(services)({
            before: test.originalCode,
            after: test.expectedFormattedCode,
        });

        // Clear loaded documents to avoid colliding URIs (https://github.com/langium/langium/issues/1146)
        await clearDocuments(services);
    });

    // Test that the expected formatted code stays the same when formatted again
    it.each(await formatterTests)('$testName (idempotence)', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Formatting must be idempotent
        await expectFormatting(services)({
            before: test.expectedFormattedCode,
            after: test.expectedFormattedCode,
        });

        // Clear loaded documents to avoid colliding URIs (https://github.com/langium/langium/issues/1146)
        await clearDocuments(services);
    });
});
