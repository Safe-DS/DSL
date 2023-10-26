module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
        ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
        ['@semantic-release/changelog', { changelogFile: 'packages/safe-ds-vscode/CHANGELOG.md' }],
        ['semantic-release-vsce', { packageVsix: true }],
        [
            '@semantic-release/github',
            {
                assets: [
                    {
                        path: '*.vsix',
                    },
                ],
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: [
                    'packages/safe-ds-vscode/package.json',
                    'packages/safe-ds-vscode/package-lock.json',
                    'packages/safe-ds-vscode/CHANGELOG.md',
                ],
            },
        ],
    ],
};
