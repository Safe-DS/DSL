import { Command } from 'commander';
import { SafeDsLanguageMetaData } from 'safe-ds';
import { generate } from './generate.js';
import * as path from 'node:path';

const fileExtensions = SafeDsLanguageMetaData.fileExtensions.join(', ');

const program = new Command();

// Version command
const packagePath = path.resolve(__dirname, '..', 'package.json');
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
    .description('generate Python code')
    .action(generate);

program.parse(process.argv);
