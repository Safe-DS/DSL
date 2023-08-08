import { createSafeDsServices } from '../../src/language-server/safe-ds-module';
import { expectFormatting } from 'langium/test';
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
    });
});
