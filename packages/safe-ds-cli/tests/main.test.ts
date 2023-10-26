import { beforeAll, describe, expect, it } from 'vitest';
import { execSync, spawnSync } from 'node:child_process';

const projectRoot = new URL('..', import.meta.url);

describe('program', () => {
    beforeAll(() => {
        execSync('npm run build:clean', { cwd: projectRoot });
    });

    it('should show usage if no arguments are passed', () => {
        const process = spawnSync('node', ['./bin/cli'], { cwd: projectRoot });
        expect(process.stderr.toString()).toContain('Usage: cli [options] [command]');
    });
});
