import { describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/index.js';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import {
    isSdsClass,
    isSdsInt,
    isSdsModule,
    isSdsString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringFull,
    isSdsTemplateStringInner,
    isSdsTemplateStringStart,
} from '../../../src/language/generated/ast.js';
import { escapeString } from '../../../src/language/grammar/safe-ds-value-converter.js';

const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;

describe('runConverter', () => {
    describe('ID', () => {
        it('should remove hat (package)', async () => {
            const code = `
                package ^foo.bar
            `;

            const module = await getNodeOfType(services, code, isSdsModule);
            expect(module.name).toBe('foo.bar');
        });

        it('should remove hat (declaration)', async () => {
            const code = `
                class ^MyClass
            `;

            const firstClass = await getNodeOfType(services, code, isSdsClass);
            expect(firstClass.name).toBe('MyClass');
        });
    });

    describe('INT', () => {
        it('should return a bigint', async () => {
            const code = `
                pipeline myPipeline {
                    123;
                }
            `;

            const firstInt = await getNodeOfType(services, code, isSdsInt);
            expect(firstInt.value).toBe(123n);
        });
    });

    const escapeSequences = [
        {
            escaped: '\\b',
            unescaped: '\b',
        },
        {
            escaped: '\\f',
            unescaped: '\f',
        },
        {
            escaped: '\\n',
            unescaped: '\n',
        },
        {
            escaped: '\\r',
            unescaped: '\r',
        },
        {
            escaped: '\\t',
            unescaped: '\t',
        },
        {
            escaped: '\\v',
            unescaped: '\v',
        },
        {
            escaped: '\\0',
            unescaped: '\0',
        },
        {
            escaped: "\\'",
            unescaped: "'",
        },
        {
            escaped: '\\"',
            unescaped: '"',
        },
        {
            escaped: '\\{',
            unescaped: '{',
        },
        {
            escaped: '\\\\',
            unescaped: '\\',
        },
        {
            escaped: '\\u0061',
            unescaped: 'a',
        },
        {
            escaped: '\\u00a9',
            unescaped: '©',
        },
        {
            escaped: '\\u00A9',
            unescaped: '©',
        },
        {
            escaped: '\\u',
            unescaped: 'u',
        },
        {
            escaped: '\\u00',
            unescaped: 'u00',
        },
        {
            escaped: '\\uWXYZ',
            unescaped: 'uWXYZ',
        },
    ];

    describe('STRING', () => {
        it('should remove delimiters', async () => {
            const code = `
                pipeline myPipeline {
                    "text";
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsString);
            expect(firstTemplateStringStart.value).toBe('text');
        });

        it.each(escapeSequences)('should unescape $escaped', async ({ escaped, unescaped }) => {
            const code = `
                pipeline myPipeline {
                    "${escaped}";
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsString);
            expect(firstTemplateStringStart.value).toBe(unescaped);
        });
    });

    describe('TEMPLATE_STRING_FULL', () => {
        it('should remove delimiters', async () => {
            const code = `
                pipeline myPipeline {
                    \`full\`;
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsTemplateStringFull);
            expect(firstTemplateStringStart.value).toBe('full');
        });

        it.each(escapeSequences)('should unescape $escaped', async ({ escaped, unescaped }) => {
            const code = `
                pipeline myPipeline {
                    \`${escaped}\`;
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsTemplateStringFull);
            expect(firstTemplateStringStart.value).toBe(unescaped);
        });
    });

    describe('TEMPLATE_STRING_START', () => {
        it('should remove delimiters', async () => {
            const code = `
                pipeline myPipeline {
                    \`start{ 1 }inner{ 2 }end\`;
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsTemplateStringStart);
            expect(firstTemplateStringStart.value).toBe('start');
        });

        it.each(escapeSequences)('should unescape $escaped', async ({ escaped, unescaped }) => {
            const code = `
                pipeline myPipeline {
                    \`${escaped}{ 1 }inner{ 2 }end\`;
                }
            `;

            const firstTemplateStringStart = await getNodeOfType(services, code, isSdsTemplateStringStart);
            expect(firstTemplateStringStart.value).toBe(unescaped);
        });
    });

    describe('TEMPLATE_STRING_INNER', () => {
        it('should remove delimiters', async () => {
            const code = `
                pipeline myPipeline {
                    \`start{ 1 }inner{ 2 }end\`;
                }
            `;

            const firstTemplateStringInner = await getNodeOfType(services, code, isSdsTemplateStringInner);
            expect(firstTemplateStringInner.value).toBe('inner');
        });

        it.each(escapeSequences)('should unescape $escaped', async ({ escaped, unescaped }) => {
            const code = `
                pipeline myPipeline {
                    \`start{ 1 }${escaped}{ 2 }end\`;
                }
            `;

            const firstTemplateStringInner = await getNodeOfType(services, code, isSdsTemplateStringInner);
            expect(firstTemplateStringInner.value).toBe(unescaped);
        });
    });

    describe('TEMPLATE_STRING_END', () => {
        it('should remove delimiters', async () => {
            const code = `
                pipeline myPipeline {
                    \`start{ 1 }inner{ 2 }end\`;
                }
            `;

            const firstTemplateStringEnd = await getNodeOfType(services, code, isSdsTemplateStringEnd);
            expect(firstTemplateStringEnd.value).toBe('end');
        });

        it.each(escapeSequences)('should unescape $escaped', async ({ escaped, unescaped }) => {
            const code = `
                pipeline myPipeline {
                    \`start{ 1 }inner{ 2 }${escaped}\`;
                }
            `;

            const firstTemplateStringEnd = await getNodeOfType(services, code, isSdsTemplateStringEnd);
            expect(firstTemplateStringEnd.value).toBe(unescaped);
        });
    });
});

describe('escapeString', () => {
    const tests = [
        { unescaped: '\b', escaped: '\\b' },
        { unescaped: '\f', escaped: '\\f' },
        { unescaped: '\n', escaped: '\\n' },
        { unescaped: '\r', escaped: '\\r' },
        { unescaped: '\t', escaped: '\\t' },
        { unescaped: '\v', escaped: '\\v' },
        { unescaped: '\0', escaped: '\\0' },
        { unescaped: '"', escaped: '\\"' },
        { unescaped: '\\', escaped: '\\\\' },
    ];

    it.each(tests)('should escape $unescaped', ({ escaped, unescaped }) => {
        expect(escapeString(unescaped)).toBe(escaped);
    });
});
