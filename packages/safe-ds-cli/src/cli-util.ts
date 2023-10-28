import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { LangiumDocument, LangiumServices, URI } from 'langium';

/* c8 ignore start */
export const extractDocument = async function (fileName: string, services: LangiumServices): Promise<LangiumDocument> {
    const extensions = services.LanguageMetaData.fileExtensions;
    if (!extensions.includes(path.extname(fileName))) {
        console.error(chalk.yellow(`Please choose a file with one of these extensions: ${extensions}.`));
        process.exit(1);
    }

    if (!fs.existsSync(fileName)) {
        console.error(chalk.red(`File ${fileName} does not exist.`));
        process.exit(1);
    }

    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(path.resolve(fileName)));
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    const errors = (document.diagnostics ?? []).filter((e) => e.severity === 1);
    if (errors.length > 0) {
        console.error(chalk.red(`The document ${fileName} has errors:`));
        for (const validationError of errors) {
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

    return document as LangiumDocument;
};
/* c8 ignore stop */
