module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
        ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
        ['@semantic-release/changelog', { changelogFile: 'packages/safe-ds-vscode/CHANGELOG.md' }],
        [
            '@semantic-release/npm',
            {
                pkgRoot: 'packages/safe-ds-cli',
            },
        ],
        [
            '@semantic-release/exec',
            {
                prepareCmd: 'npm version ${nextRelease.version}',
                publishCmd: 'npm run package && npm run publish',
                execCwd: 'packages/safe-ds-vscode',
            },
        ],
        [
            '@semantic-release/github',
            {
                assets: [
                    {
                        path: 'packages/safe-ds-vscode/*.vsix',
                    },
                ],
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: [
                    'packages/safe-ds-cli/package.json',
                    'packages/safe-ds-vscode/package.json',
                    'packages/safe-ds-vscode/CHANGELOG.md',
                ],
            },
        ],
    ],
};
