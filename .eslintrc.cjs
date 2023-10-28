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
            files: ['packages/safe-ds-cli/src/**'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
};
