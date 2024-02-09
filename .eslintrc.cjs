module.exports = {
    root: true,
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json',
    },
    settings: {
        jest: {
            version: 28,
        },
    },
    extends: '@lars-reimann',
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
        {
            files: ['packages/safe-ds-editor/src/**'],
            rules: {
                'import/no-default-export': 'off',
                'no-console': 'off',
            },
        },
    ],
};
