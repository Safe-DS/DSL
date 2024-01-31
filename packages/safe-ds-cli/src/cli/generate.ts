import { createSafeDsServicesWithBuiltins } from '@safe-ds/lang';
import chalk from 'chalk';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import fs from 'node:fs';
import path from 'node:path';
import { extractDocuments } from '../helpers/documents.js';
import { makeParentDirectoriesSync } from '../helpers/files.js';
import { exitIfDocumentHasErrors } from '../helpers/diagnostics.js';

export const generate = async (fsPaths: string[], options: GenerateOptions): Promise<void> => {
    const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
    const documents = await extractDocuments(services, fsPaths);

    // Exit if any document has errors before generating code
    for (const document of documents) {
        exitIfDocumentHasErrors(document);
    }

    // Generate code
    for (const document of documents) {
        const generatedFiles = services.generation.PythonGenerator.generate(document, {
            destination: URI.file(path.resolve(options.out)),
            createSourceMaps: options.sourcemaps,
            targetPlaceholder: undefined,
            disableRunnerIntegration: false
        });

        for (const file of generatedFiles) {
            const fsPath = URI.parse(file.uri).fsPath;
            makeParentDirectoriesSync(fsPath);
            fs.writeFileSync(fsPath, file.getText());
        }
    }

    console.log(chalk.green(`Python code generated successfully.`));
};

/**
 * Command line options for the `generate` command.
 */
export interface GenerateOptions {
    out: string;
    sourcemaps: boolean;
}
