import { Command } from 'commander';
import { SafeDsLanguageMetaData } from '../language/generated/module.js';
import { generateAction } from './generator.js';
import * as path from 'node:path';

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');

const fileExtensions = SafeDsLanguageMetaData.fileExtensions.join(', ');

const program = new Command();

program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .version(require(packagePath).version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${fileExtensions}`)
    .option('-d, --destination <dir>', 'destination directory of generation')
    .option('-r, --root <dir>', 'source root folder')
    .option('-q, --quiet', 'whether the program should print something', false)
    .description('generate Python code')
    .action(generateAction);

program.parse(process.argv);
