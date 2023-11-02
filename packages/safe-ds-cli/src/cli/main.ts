import { SafeDsLanguageMetaData } from '@safe-ds/lang';
import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'url';
import { generate } from './generate.js';

const fileExtensions = SafeDsLanguageMetaData.fileExtensions.join(', ');

const program = new Command();

// Version command
const packagePath = fileURLToPath(new URL('../../package.json', import.meta.url));
const require = createRequire(import.meta.url);
program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require(packagePath).version);

// Generate command
program
    .command('generate')
    .argument('<file>', `possible file extensions: ${fileExtensions}`)
    .option('-d, --destination <dir>', 'destination directory of generation')
    .option('-r, --root <dir>', 'source root folder')
    .option('-q, --quiet', 'whether the program should print something', false)
    .option('-s, --sourcemaps', 'whether source maps should be generated', false)
    .description('generate Python code')
    .action(generate);

program.parse(process.argv);
