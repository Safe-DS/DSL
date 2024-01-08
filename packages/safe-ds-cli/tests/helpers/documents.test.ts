import { describe, expect, it } from 'vitest';
import { Result } from 'true-myth';
import { processPaths } from '../../src/helpers/documents.js';
import { createSafeDsServicesWithBuiltins } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { fileURLToPath } from 'url';
import path from 'node:path';
import { ExitCode } from '../../src/cli/exitCode.js';

describe('processPaths', async () => {
    const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
    const testResourcesRoot = new URL('../resources/processPaths/', import.meta.url);

    const tests: ProcessPathsTest[] = [
        {
            testName: 'pipe file',
            paths: ['a.sdspipe'],
            expected: Result.ok(['a.sdspipe']),
        },
        {
            testName: 'stub file',
            paths: ['b.sdsstub'],
            expected: Result.ok(['b.sdsstub']),
        },
        {
            testName: 'test file',
            paths: ['c.sdstest'],
            expected: Result.ok(['c.sdstest']),
        },
        {
            testName: 'multiple files',
            paths: ['a.sdspipe', 'b.sdsstub', 'c.sdstest'],
            expected: Result.ok(['a.sdspipe', 'b.sdsstub', 'c.sdstest']),
        },
        {
            testName: 'duplicates',
            paths: ['a.sdspipe', 'a.sdspipe'],
            expected: Result.ok(['a.sdspipe']),
        },
        {
            testName: 'directory',
            paths: ['.'],
            expected: Result.ok([
                'a.sdspipe',
                'b.sdsstub',
                'c.sdstest',
                'nested/a.sdspipe',
                'nested/b.sdsstub',
                'nested/c.sdstest',
            ]),
        },
        {
            testName: 'missing file',
            paths: ['missing.txt'],
            expected: Result.err(ExitCode.MissingPath),
        },
        {
            testName: 'not a Safe-DS file',
            paths: ['d.txt'],
            expected: Result.err(ExitCode.FileWithoutSafeDsExtension),
        },
    ];

    it.each(tests)('$testName', ({ paths, expected }) => {
        const absolutePaths = paths.map((p) => fileURLToPath(new URL(p, testResourcesRoot)));
        const actual = processPaths(services, absolutePaths);

        if (expected.isErr) {
            expect(actual.isErr).toBeTruthy();
            if (actual.isErr) {
                expect(actual.error.code).toBe(expected.error);
            }
        } else {
            expect(actual.isOk).toBeTruthy();
            if (actual.isOk) {
                const relativePaths = actual.value.map((uri) =>
                    path.relative(fileURLToPath(testResourcesRoot), uri.fsPath).replaceAll('\\', '/'),
                );
                expect(relativePaths).toStrictEqual(expected.value);
            }
        }
    });
});

/**
 * A test case for the `processPaths` function.
 */
interface ProcessPathsTest {
    /**
     * A human-readable name for the test case.
     */
    testName: string;

    /**
     * The paths to process.
     */
    paths: string[];

    /**
     * The expected result.
     */
    expected: Result<string[], number>;
}
