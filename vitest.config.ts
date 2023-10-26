import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        chaiConfig: {
            truncateThreshold: 200,
        },
        coverage: {
            provider: 'v8',
            include: ['**/src'],
            exclude: ['**/generated'],
        },
        exclude: ['node_modules', 'dist', 'lib', 'out'],
    },
});
