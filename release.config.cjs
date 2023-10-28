module.exports = {
    branches: ['main'],
    plugins: [
        ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
        ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
        // We don't create a changelog for the CLI, because only few changes in the repo are related to it
        ['@semantic-release/changelog', { changelogFile: 'packages/safe-ds-lang/CHANGELOG.md' }],
        ['@semantic-release/changelog', { changelogFile: 'packages/safe-ds-vscode/CHANGELOG.md' }],
        ['@semantic-release/npm', { pkgRoot: 'packages/safe-ds-cli' }],
        ['@semantic-release/npm', { pkgRoot: 'packages/safe-ds-lang' }],
        [
            '@semantic-release/exec',
            {
                prepareCmd: 'npm version ${nextRelease.version}',
                publishCmd: 'npm run package && npm run deploy',
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
                    'packages/safe-ds-lang/CHANGELOG.md',
                    'packages/safe-ds-lang/package.json',
                    'packages/safe-ds-vscode/CHANGELOG.md',
                    'packages/safe-ds-vscode/package.json',
                ],
            },
        ],
    ],
};
