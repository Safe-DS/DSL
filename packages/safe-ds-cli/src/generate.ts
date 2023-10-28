import { createSafeDsServicesWithBuiltins } from '@safe-ds/lang';
import chalk from 'chalk';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import fs from 'node:fs';
import path from 'node:path';
import { extractDocument } from './cli-util.js';

/* c8 ignore start */
export const generate = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
    const document = await extractDocument(fileName, services);
    const destination = opts.destination ?? path.join(path.dirname(fileName), 'generated');
    const generatedFiles = services.generation.PythonGenerator.generate(document, URI.file(path.resolve(destination)));

    for (const file of generatedFiles) {
        const fsPath = URI.parse(file.uri).fsPath;
        const parentDirectoryPath = path.dirname(fsPath);
        if (!fs.existsSync(parentDirectoryPath)) {
            fs.mkdirSync(parentDirectoryPath, { recursive: true });
        }

        fs.writeFileSync(fsPath, file.getText());
    }

    console.log(chalk.green(`Python code generated successfully.`));
};

/* c8 ignore stop */

export interface GenerateOptions {
    destination?: string;
}
