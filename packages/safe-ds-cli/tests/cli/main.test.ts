import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ExitCode } from '../../src/cli/exitCode.js';

const projectRoot = new URL('../..', import.meta.url);

describe('safe-ds', () => {
    beforeAll(() => {
        execSync('npm run build:clean', { cwd: projectRoot });
    });

    describe('root', () => {
        const spawnRootProcess = (additionalArguments: string[]) => {
            return spawnSync('node', ['./bin/cli', ...additionalArguments], { cwd: projectRoot });
        };

        it('should show usage on stderr if no arguments are passed', () => {
            const process = spawnRootProcess([]);
            expect(process.stderr.toString()).toContain('Usage: cli [options] [command]');
            expect(process.status).not.toBe(ExitCode.Success);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnRootProcess(['-h']);
            expect(process.stdout.toString()).toContain('Usage: cli [options] [command]');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show version if -V flag is passed', () => {
            const process = spawnRootProcess(['-V']);
            expect(process.stdout.toString()).toMatch(/\d+\.\d+\.\d+/u);
            expect(process.status).toBe(ExitCode.Success);
        });
    });

    describe('check', () => {
        const testResourcesRoot = new URL('../resources/check/', import.meta.url);
        const spawnCheckProcess = (additionalArguments: string[], paths: string[]) => {
            const fsPaths = paths.map((p) => fileURLToPath(new URL(p, testResourcesRoot)));
            return spawnSync('node', ['./bin/cli', 'check', ...additionalArguments, ...fsPaths], {
                cwd: projectRoot,
            });
        };

        it('should show an error if no paths are passed', () => {
            const process = spawnCheckProcess([], []);
            expect(process.stderr.toString()).toContain("error: missing required argument 'paths'");
            expect(process.status).not.toBe(ExitCode.Success);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnCheckProcess(['-h'], []);
            expect(process.stdout.toString()).toContain('Usage: cli check');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show errors in wrong files', () => {
            const process = spawnCheckProcess([], ['.']);
            expect(process.stderr.toString()).toMatch(/Found \d+ errors?\./u);
            expect(process.status).toBe(ExitCode.FileHasErrors);
        });

        it('should show not show errors in correct files', () => {
            const process = spawnCheckProcess([], ['correct.sdsdev']);
            expect(process.stdout.toString()).toContain('No errors found.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should handle references to builtins', () => {
            const process = spawnCheckProcess([], ['references builtins.sdsdev']);
            expect(process.stdout.toString()).toContain('No errors found.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should treat warnings as errors in strict mode', () => {
            const process = spawnCheckProcess(['-s'], ['contains warnings.sdsdev']);
            expect(process.stderr.toString()).toMatch(/Found \d+ errors?\./u);
            expect(process.status).toBe(ExitCode.FileHasErrors);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnCheckProcess([], ['missing.sdsdev']);
            expect(process.stderr.toString()).toMatch(/Path .* does not exist\./u);
            expect(process.status).toBe(ExitCode.MissingPath);
        });

        it('should show an error if a file has the wrong extension', () => {
            const process = spawnCheckProcess([], ['not safe-ds.txt']);
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).toBe(ExitCode.FileWithoutSafeDsExtension);
        });
    });

    describe('document', () => {
        const testResourcesRoot = new URL('../resources/document/', import.meta.url);
        const out = new URL('generated', testResourcesRoot);
        const spawnDocumentProcess = (additionalArguments: string[], paths: string[]) => {
            const fsPaths = paths.map((p) => fileURLToPath(new URL(p, testResourcesRoot)));
            return spawnSync(
                'node',
                ['./bin/cli', 'document', '-o', fileURLToPath(out), ...additionalArguments, ...fsPaths],
                {
                    cwd: projectRoot,
                },
            );
        };

        afterAll(() => {
            fs.rmSync(out, { recursive: true, force: true });
        });

        it('should show an error if no paths are passed', () => {
            const process = spawnDocumentProcess([], []);
            expect(process.stderr.toString()).toContain("error: missing required argument 'paths'");
            expect(process.status).not.toBe(ExitCode.Success);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnDocumentProcess(['-h'], []);
            expect(process.stdout.toString()).toContain('Usage: cli document');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should generate Markdown documentation', () => {
            const process = spawnDocumentProcess([], ['correct.sdsdev']);
            expect(process.stdout.toString()).toContain('Markdown documentation generated successfully.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should generate Markdown documentation (Safe-DS code references builtins)', () => {
            const process = spawnDocumentProcess([], ['references builtins.sdsdev']);
            expect(process.stdout.toString()).toContain('Markdown documentation generated successfully.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnDocumentProcess([], ['missing.sdsdev']);
            expect(process.stderr.toString()).toMatch(/Path .* does not exist./u);
            expect(process.status).toBe(ExitCode.MissingPath);
        });

        it('should show an error if the file has the wrong extension', () => {
            const process = spawnDocumentProcess([], ['not safe-ds.txt']);
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).toBe(ExitCode.FileWithoutSafeDsExtension);
        });

        it('should show an error if a Safe-DS file has errors', () => {
            const process = spawnDocumentProcess([], ['.']);
            expect(process.stderr.toString()).toContain(
                "Could not find a declaration named 'Unresolved' in this context.",
            );
            expect(process.status).toBe(ExitCode.FileHasErrors);
        });
    });

    describe('format', () => {
        const testResourcesRoot = new URL('../resources/format/', import.meta.url);
        const spawnFormatProcess = (additionalArguments: string[], paths: string[]) => {
            const fsPaths = paths.map((p) => fileURLToPath(new URL(p, testResourcesRoot)));
            return spawnSync('node', ['./bin/cli', 'format', ...additionalArguments, ...fsPaths], {
                cwd: projectRoot,
            });
        };

        it('should show an error if no paths are passed', () => {
            const process = spawnFormatProcess([], []);
            expect(process.stderr.toString()).toContain("error: missing required argument 'paths'");
            expect(process.status).not.toBe(ExitCode.Success);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnFormatProcess(['-h'], []);
            expect(process.stdout.toString()).toContain('Usage: cli format');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show errors in wrong files', () => {
            const process = spawnFormatProcess([], ['.']);
            expect(process.stderr.toString()).toContain('has syntax errors');
            expect(process.status).toBe(ExitCode.FileHasErrors);
        });

        it('should show not show errors in correct files', () => {
            const process = spawnFormatProcess([], ['correct.sdsdev']);
            expect(process.stdout.toString()).toContain('Safe-DS code formatted successfully.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnFormatProcess([], ['missing.sdsdev']);
            expect(process.stderr.toString()).toMatch(/Path .* does not exist\./u);
            expect(process.status).toBe(ExitCode.MissingPath);
        });

        it('should show an error if a file has the wrong extension', () => {
            const process = spawnFormatProcess([], ['not safe-ds.txt']);
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).toBe(ExitCode.FileWithoutSafeDsExtension);
        });
    });

    describe('generate', () => {
        const testResourcesRoot = new URL('../resources/generate/', import.meta.url);
        const out = new URL('generated', testResourcesRoot);
        const spawnGenerateProcess = (additionalArguments: string[], paths: string[]) => {
            const fsPaths = paths.map((p) => fileURLToPath(new URL(p, testResourcesRoot)));
            return spawnSync(
                'node',
                ['./bin/cli', 'generate', '-o', fileURLToPath(out), ...additionalArguments, ...fsPaths],
                {
                    cwd: projectRoot,
                },
            );
        };

        afterAll(() => {
            fs.rmSync(out, { recursive: true, force: true });
        });

        it('should show an error if no paths are passed', () => {
            const process = spawnGenerateProcess([], []);
            expect(process.stderr.toString()).toContain("error: missing required argument 'paths'");
            expect(process.status).not.toBe(ExitCode.Success);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnGenerateProcess(['-h'], []);
            expect(process.stdout.toString()).toContain('Usage: cli generate');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should generate Python code', () => {
            const process = spawnGenerateProcess([], ['correct.sdsdev']);
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should generate Python code (Safe-DS code references builtins)', () => {
            const process = spawnGenerateProcess([], ['references builtins.sdsdev']);
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(ExitCode.Success);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnGenerateProcess([], ['missing.sdsdev']);
            expect(process.stderr.toString()).toMatch(/Path .* does not exist./u);
            expect(process.status).toBe(ExitCode.MissingPath);
        });

        it('should show an error if the file has the wrong extension', () => {
            const process = spawnGenerateProcess([], ['not safe-ds.txt']);
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).toBe(ExitCode.FileWithoutSafeDsExtension);
        });

        it('should show an error if a Safe-DS file has errors', () => {
            const process = spawnGenerateProcess([], ['.']);
            expect(process.stderr.toString()).toContain(
                "Could not find a declaration named 'Unresolved' in this context.",
            );
            expect(process.status).toBe(ExitCode.FileHasErrors);
        });
    });
});
