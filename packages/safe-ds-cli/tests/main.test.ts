import { beforeAll, describe, expect, it } from 'vitest';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import url from 'node:url';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

describe('program', () => {
    beforeAll(() => {
        execSync('npm run build', { cwd: projectRoot });
    });

    it('should show usage if no arguments are passed', () => {
        const process = spawnSync('node', ['./bin/cli'], { cwd: projectRoot });
        expect(process.stderr.toString()).toContain('Usage: cli [options] [command]');
    });
});
