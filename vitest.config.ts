import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        chaiConfig: {
            truncateThreshold: 0,
        },
        coverage: {
            provider: 'v8',
            include: ['src'],
            exclude: ['**/generated'],
        },
        exclude: ['node_modules', 'out'],
    },
});
