import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { generate } from './generate.js';
import { check } from './check.js';
import { format } from './format.js';

const program = new Command();

// Version command
const packagePath = fileURLToPath(new URL('../../package.json', import.meta.url));
const require = createRequire(import.meta.url);
program.version(require(packagePath).version);

// Check command
program
    .command('check')
    .argument('<paths...>', `list of files or directories to check`)
    .option('-s, --strict', 'whether the program should fail on warnings', false)
    .description('check Safe-DS code')
    .action(check);

// Format command
program
    .command('format')
    .argument('<paths...>', `list of files or directories to format`)
    .description('format Safe-DS code')
    .action(format);

// Generate command
program
    .command('generate')
    .argument('<paths...>', `list of files or directories to generate Python code for`)
    .option('-o, --out <dir>', 'destination directory for generation', 'generated')
    .option('-s, --sourcemaps', 'whether source maps should be generated', false)
    .description('generate Python code')
    .action(generate);

program.parse(process.argv);
