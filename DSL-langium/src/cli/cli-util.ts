import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { AstNode, LangiumDocument, LangiumServices } from 'langium';
import { URI } from 'vscode-uri';

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
    await services.shared.workspace.DocumentBuilder.build([document], { validationChecks: 'all' });

    const validationErrors = (document.diagnostics ?? []).filter((e) => e.severity === 1);
    if (validationErrors.length > 0) {
        // eslint-disable-next-line no-console
        console.error(chalk.red('There are validation errors:'));
        for (const validationError of validationErrors) {
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

export const extractAstNode = async function <T extends AstNode>(
    fileName: string,
    services: LangiumServices,
): Promise<T> {
    return (await extractDocument(fileName, services)).parseResult?.value as T;
};

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
