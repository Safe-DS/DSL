import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        chaiConfig: {
            truncateThreshold: 200,
        },
        coverage: {
            provider: 'v8',
            // For the CLI: Since we run it in a subprocess, coverage is not collected.
            // For the VS Code extension: We cannot test the existing code at the moment.
            include: ['packages/safe-ds-lang/src'],
            exclude: ['**/generated'],
        },
        exclude: ['node_modules', 'dist', 'lib'],
    },
});
