import { createSafeDsServices } from '@safe-ds/lang';
import chalk from 'chalk';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import fs from 'node:fs';
import path from 'node:path';
import { extractDocuments } from '../helpers/documents.js';
import { makeParentDirectoriesSync } from '../helpers/files.js';
import { exitIfDocumentHasErrors } from '../helpers/diagnostics.js';

export const doDocument = async (fsPaths: string[], options: DocumentOptions): Promise<void> => {
    const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
    const documents = await extractDocuments(services, fsPaths);

    // Exit if any document has errors before generating code
    for (const document of documents) {
        exitIfDocumentHasErrors(document);
    }

    // Generate code
    const generatedFiles = services.generation.MarkdownGenerator.generate(documents, {
        destination: URI.file(path.resolve(options.out)),
    });

    for (const file of generatedFiles) {
        const fsPath = URI.parse(file.uri).fsPath;
        makeParentDirectoriesSync(fsPath);
        fs.writeFileSync(fsPath, file.getText());
    }

    console.log(chalk.green(`Markdown documentation generated successfully.`));
};

/**
 * Command line options for the `document` command.
 */
export interface DocumentOptions {
    out: string;
}
