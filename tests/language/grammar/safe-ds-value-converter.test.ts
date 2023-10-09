import { describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import {
    isSdsClass,
    isSdsModule, isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringStart,
} from '../../../src/language/generated/ast.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;

describe('runConverter', () => {
    it('should remove backticks from IDs (package)', async () => {
        const code = `
            package \`foo\`.bar
        `;

        const module = await getNodeOfType(services, code, isSdsModule);
        expect(module.name).toBe('foo.bar');
    });

    it('should remove backticks from IDs (declaration)', async () => {
        const code = `
            class \`MyClass\`
        `;

        const firstClass = await getNodeOfType(services, code, isSdsClass);
        expect(firstClass.name).toBe('MyClass');
    });

    it('should remove delimiters from TEMPLATE_STRING_STARTs', async () => {
        const code = `
            pipeline myPipeline {
                "start{{ 1 }}inner{{ 2 }}end";
            }
        `;

        const firstTemplateStringStart = await getNodeOfType(services, code, isSdsTemplateStringStart);
        expect(firstTemplateStringStart.value).toBe('start');
    });

    it('should remove delimiters from TEMPLATE_STRING_INNERs', async () => {
        const code = `
            pipeline myPipeline {
                "start{{ 1 }}inner{{ 2 }}end";
            }
        `;

        const firstTemplateStringInner = await getNodeOfType(services, code, isSdsTemplateStringInner);
        expect(firstTemplateStringInner.value).toBe('inner');
    });

    it('should remove delimiters from TEMPLATE_STRING_ENDs', async () => {
        const code = `
            pipeline myPipeline {
                "start{{ 1 }}inner{{ 2 }}end";
            }
        `;

        const firstTemplateStringEnd = await getNodeOfType(services, code, isSdsTemplateStringEnd);
        expect(firstTemplateStringEnd.value).toBe('end');
    });
});
