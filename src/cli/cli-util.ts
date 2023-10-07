import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { AstNode, LangiumDocument, LangiumServices, URI } from 'langium';

/* c8 ignore start */
export const extractAstNode = async function <T extends AstNode>(
    fileName: string,
    services: LangiumServices,
): Promise<T> {
    return (await extractDocument(fileName, services)).parseResult?.value as T;
};

export const extractDocument = async function (fileName: string, services: LangiumServices): Promise<LangiumDocument> {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        // eslint-disable-next-line no-console
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        // eslint-disable-next-line no-console
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }

    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(fileName)));
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    const errors = (document.diagnostics ?? []).filter((e) => e.severity === 1);
    if (errors.length > 0) {
        // eslint-disable-next-line no-console
        console.error(chalk.red(`The document ${fileName} has errors:`));
        for (const validationError of errors) {
            // eslint-disable-next-line no-console
            console.error(
                chalk.red(
                    `line ${validationError.range.start.line + 1}: ${
                        validationError.message
                    } [${document.textDocument.getText(validationError.range)}]`,
                ),
            );
        }
        process.exit(1);
    }

    return document;
};
/* c8 ignore stop */

interface FilePathData {
    destination: string;
    name: string;
}

export const extractDestinationAndName = function (filePath: string, destination: string | undefined): FilePathData {
    const baseFilePath = path.basename(filePath, path.extname(filePath)).replace(/[.-]/gu, '');
    return {
        destination: destination ?? path.join(path.dirname(baseFilePath), 'generated'),
        name: path.basename(baseFilePath),
    };
};
