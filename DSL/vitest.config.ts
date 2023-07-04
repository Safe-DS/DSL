import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        chaiConfig: {
            truncateThreshold: 0,
        },
        coverage: {
            provider: 'istanbul',
            include: ['src'],
            exclude: ['**/generated'],
        },
    },
});
