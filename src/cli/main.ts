import {Command} from 'commander';
import {SafeDsLanguageMetaData} from '../language/generated/module.js';
import {generateAction} from './generator.js';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

const fileExtensions = SafeDsLanguageMetaData.fileExtensions.join(', ');

const program = new Command();

program.version(JSON.parse(packageContent).version);

program
    .command('generate')
    .argument('<file>', `possible file extensions: ${fileExtensions}`)
    .option('-d, --destination <dir>', 'destination directory of generation')
    .option('-r, --root <dir>', 'source root folder')
    .option('-q, --quiet', 'whether the program should print something', false)
    .description('generates Python code')
    .action(generateAction);

program.parse(process.argv);
