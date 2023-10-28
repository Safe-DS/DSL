import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = new URL('../..', import.meta.url);

describe('safe-ds', () => {
    beforeAll(() => {
        execSync('npm run build:clean', { cwd: projectRoot });
    });

    it('should show usage on stderr if no arguments are passed', () => {
        const process = spawnSync('node', ['./bin/cli'], { cwd: projectRoot });
        expect(process.stderr.toString()).toContain('Usage: cli [options] [command]');
    });

    it('should show usage on stdout if -h flag is passed', () => {
        const process = spawnSync('node', ['./bin/cli', '-h'], { cwd: projectRoot });
        expect(process.stdout.toString()).toContain('Usage: cli [options] [command]');
    });

    it('should show version if -V flag is passed', () => {
        const process = spawnSync('node', ['./bin/cli', '-V'], { cwd: projectRoot });
        expect(process.stdout.toString()).toMatch(/\d+\.\d+\.\d+/u);
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
        });

        it('should generate Python code (Safe-DS code references builtins)', () => {
            const process = spawnGenerateProcess('references builtins.sdstest');
            expect(process.stdout.toString()).toContain('Python code generated successfully.');
        });

        it('should show an error if the file does not exist', () => {
            const process = spawnGenerateProcess('missing.sdstest');
            expect(process.stderr.toString()).toMatch(/File .* does not exist./u);
        });

        it('should show an error if the file has the wrong extension', () => {
            const process = spawnGenerateProcess('not safe-ds.txt');
            expect(process.stderr.toString()).toContain('Please choose a file with one of these extensions');
        });

        it('should show an error if the Safe-DS file has errors', () => {
            const process = spawnGenerateProcess('contains errors.sdstest');
            expect(process.stderr.toString()).toContain(
                "Could not resolve reference to SdsNamedTypeDeclaration named 'Unresolved'",
            );
        });
    });
});
