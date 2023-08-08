import { createSafeDsServices } from '../../src/language-server/safe-ds-module';
import {clearDocuments, expectFormatting} from 'langium/test';
import { describe, it } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { createFormatterTest } from './creator';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;

describe('formatter', async () => {
    it.each(await createFormatterTest())('$testName', async (test) => {
        if (test.error) {
            throw test.error;
        }

        await expectFormatting(services)({
            before: test.originalCode,
            after: test.expectedFormattedCode,
        });

        // Clear loaded documents to avoid colliding URIs (https://github.com/langium/langium/issues/1146)
        await clearDocuments(services);
    });
});
