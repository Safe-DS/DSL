//@ts-check
import * as esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import fs from 'fs/promises';

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

const success = watch ? 'Watch build succeeded' : 'Build succeeded';

const getTime = function () {
    const date = new Date();
    return `[${`${padZeroes(date.getHours())}:${padZeroes(date.getMinutes())}:${padZeroes(date.getSeconds())}`}] `;
};

const padZeroes = function (i) {
    return i.toString().padStart(2, '0');
};

const plugins = [
    {
        name: 'clean-old-builtins',
        setup(build) {
            build.onStart(async () => {
                await fs.rm('./out/resources', { force: true, recursive: true });
            });
        },
    },
    copy({
        assets: {
            from: ['./src/resources/**/*'],
            to: ['./resources'],
        },
        watch,
    }),
    {
        name: 'watch-plugin',
        setup(build) {
            build.onEnd((result) => {
                if (result.errors.length === 0) {
                    console.log(getTime() + success);
                }
            });
        },
    },
];

const ctx = await esbuild.context({
    // Entry points for the vscode extension and the language server
    entryPoints: ['src/cli/main.ts', 'src/extension/main.ts', 'src/language/main.ts'],
    outdir: 'dist',
    bundle: true,
    target: 'ES2020',
    // VSCode's extension host is still using cjs, so we need to transform the code
    format: 'cjs',
    // To prevent confusing node, we explicitly use the `.cjs` extension
    outExtension: {
        '.js': '.cjs',
    },
    loader: { '.ts': 'ts' },
    external: ['vscode'],
    platform: 'node',
    sourcemap: !minify,
    minify,
    plugins,
});

if (watch) {
    await ctx.watch();
} else {
    await ctx.rebuild();
    ctx.dispose();
}
