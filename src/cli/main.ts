import chalk from 'chalk';
import { Command } from 'commander';
import { SdsModule } from '../language/generated/ast.js';
import { SafeDsLanguageMetaData } from '../language/generated/module.js';
import { createSafeDsServices } from '../language/safe-ds-module.js';
import { extractAstNode } from './cli-util.js';
import { generatePython } from './generator.js';
import { NodeFileSystem } from 'langium/node';

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
    const module = await extractAstNode<SdsModule>(fileName, services);
    const generatedFilePath = generatePython(module, fileName, opts.destination);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
};

// eslint-disable-next-line import/no-default-export, func-names
export default function (): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    const fileExtensions = SafeDsLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateAction);

    program.parse(process.argv);
}
