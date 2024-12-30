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
        'svelte/valid-compile': 'off',
    },
    overrides: [
        {
            files: ['packages/safe-ds-cli/src/**', 'packages/safe-ds-vscode/src/extension/output.ts'],
            rules: {
                'no-console': 'off',
            },
        },
        {
            files: ['*.svelte'],
            rules: {
                // Leads to false positives when running ESLint in CI with the MegaLinter
                'import/no-unresolved': 'off',
            },
        },
        {
            files: ['packages/safe-ds-editor/src/**'],
            rules: {
                'import/no-default-export': 'off',
                'no-console': 'off',
            },
        },
    ],
};
