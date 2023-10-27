import chalk from 'chalk';
import { NodeFileSystem } from 'langium/node';
import fs from 'node:fs';
import { URI } from 'langium';
import path from 'node:path';
import { extractDocument } from './cli-util.js';
import { createSafeDsServices } from 'safe-ds';

/* c8 ignore start */
export const generate = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
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

    // eslint-disable-next-line no-console
    console.log(chalk.green(`Python code generated successfully.`));
};

/* c8 ignore stop */

export interface GenerateOptions {
    destination?: string;
}
