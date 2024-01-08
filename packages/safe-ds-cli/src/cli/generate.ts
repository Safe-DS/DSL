import { createSafeDsServicesWithBuiltins } from '@safe-ds/lang';
import chalk from 'chalk';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import fs from 'node:fs';
import path from 'node:path';
import { extractDocuments } from '../helpers/documents.js';
import { makeParentDirectoriesSync } from '../helpers/files.js';
import { exitIfDocumentHasErrors } from '../helpers/diagnostics.js';

export const generate = async (fileName: string, options: GenerateOptions): Promise<void> => {
    const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
    const document = (await extractDocuments(services, [fileName]))[0]!;
    exitIfDocumentHasErrors(document);
    const destination = options.out ?? path.join(path.dirname(fileName), 'generated');
    const generatedFiles = services.generation.PythonGenerator.generate(document, {
        destination: URI.file(path.resolve(destination)),
        createSourceMaps: options.sourcemaps,
    });

    for (const file of generatedFiles) {
        const fsPath = URI.parse(file.uri).fsPath;
        makeParentDirectoriesSync(fsPath);
        fs.writeFileSync(fsPath, file.getText());
    }

    console.log(chalk.green(`Python code generated successfully.`));
};

/**
 * Command line options for the `generate` command.
 */
export interface GenerateOptions {
    out?: string;
    sourcemaps: boolean;
}
