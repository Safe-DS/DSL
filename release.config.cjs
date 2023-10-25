module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
        ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
        ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
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
                assets: ['CHANGELOG.md'],
            },
        ],
    ],
};
