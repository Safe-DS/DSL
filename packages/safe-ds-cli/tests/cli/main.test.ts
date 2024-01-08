import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = new URL('../..', import.meta.url);

describe('safe-ds', () => {
    beforeAll(() => {
        execSync('npm run build:clean', { cwd: projectRoot });
    });

    describe('root', () => {
        const spawnRootProcess = (additionalFlags: string[]) => {
            return spawnSync('node', ['./bin/cli', ...additionalFlags], { cwd: projectRoot });
        };

        it('should show usage on stderr if no arguments are passed', () => {
            const process = spawnRootProcess([]);
            expect(process.stderr.toString()).toContain('Usage: cli [options] [command]');
            expect(process.status).not.toBe(0);
        });

        it('should show usage on stdout if -h flag is passed', () => {
            const process = spawnRootProcess(['-h']);
            expect(process.stdout.toString()).toContain('Usage: cli [options] [command]');
            expect(process.status).toBe(0);
        });

        it('should show version if -V flag is passed', () => {
            const process = spawnRootProcess(['-V']);
            expect(process.stdout.toString()).toMatch(/\d+\.\d+\.\d+/u);
            expect(process.status).toBe(0);
        });
    });

    describe('check', () => {
        const testResourcesRoot = new URL('../resources/check/', import.meta.url);
        const spawnGenerateProcess = (fileName: string) => {
            const fsPath = fileURLToPath(new URL(fileName, testResourcesRoot));
            return spawnSync('node', ['./bin/cli', 'check', fsPath], {
                cwd: projectRoot,
            });
        };

        it('should generate Python code', () => {
            const process = spawnGenerateProcess('correct.sdstest');
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(0);
        });

        it('should generate Python code (Safe-DS code references builtins)', () => {
            const process = spawnGenerateProcess('references builtins.sdstest');
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(0);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnGenerateProcess('missing.sdstest');
            expect(process.stderr.toString()).toMatch(/Path .* does not exist./u);
            expect(process.status).not.toBe(0);
        });

        it('should show an error if the file has the wrong extension', () => {
            const process = spawnGenerateProcess('not safe-ds.txt');
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).not.toBe(0);
        });

        it('should show an error if the Safe-DS file has errors', () => {
            const process = spawnGenerateProcess('contains errors.sdstest');
            expect(process.stderr.toString()).toContain(
                "Could not resolve reference to SdsNamedTypeDeclaration named 'Unresolved'",
            );
            expect(process.status).not.toBe(0);
        });
    });

    describe('generate', () => {
        const testResourcesRoot = new URL('../resources/generate/', import.meta.url);
        const spawnGenerateProcess = (fileName: string) => {
            const fsPath = fileURLToPath(new URL(fileName, testResourcesRoot));
            return spawnSync('node', ['./bin/cli', 'generate', fsPath], {
                cwd: projectRoot,
            });
        };

        afterAll(() => {
            fs.rmSync(new URL('generated', testResourcesRoot), { recursive: true, force: true });
        });

        it('should generate Python code', () => {
            const process = spawnGenerateProcess('correct.sdstest');
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(0);
        });

        it('should generate Python code (Safe-DS code references builtins)', () => {
            const process = spawnGenerateProcess('references builtins.sdstest');
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
            expect(process.status).toBe(0);
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnGenerateProcess('missing.sdstest');
            expect(process.stderr.toString()).toMatch(/Path .* does not exist./u);
            expect(process.status).not.toBe(0);
        });

        it('should show an error if the file has the wrong extension', () => {
            const process = spawnGenerateProcess('not safe-ds.txt');
            expect(process.stderr.toString()).toContain('does not have a Safe-DS extension');
            expect(process.status).not.toBe(0);
        });

        it('should show an error if the Safe-DS file has errors', () => {
            const process = spawnGenerateProcess('contains errors.sdstest');
            expect(process.stderr.toString()).toContain(
                "Could not resolve reference to SdsNamedTypeDeclaration named 'Unresolved'",
            );
            expect(process.status).not.toBe(0);
        });
    });
});
