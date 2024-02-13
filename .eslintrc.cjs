module.exports = {
    root: true,
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
    },

    extends: '@lars-reimann/svelte',
    rules: {
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'vitest/prefer-lowercase-title': 'off',
    },
    overrides: [
        {
            files: ['packages/safe-ds-cli/src/**', 'packages/safe-ds-vscode/src/extension/output.ts'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
};
