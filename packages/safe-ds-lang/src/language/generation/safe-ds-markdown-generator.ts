import { SafeDsServices } from '../safe-ds-module.js';
import { DocumentationProvider, LangiumDocument, URI } from 'langium';
import { TextDocument } from 'vscode-languageserver-textdocument';

export class SafeDsMarkdownGenerator {
    private readonly documentationProvider: DocumentationProvider;

    constructor(services: SafeDsServices) {
        this.documentationProvider = services.documentation.DocumentationProvider;
    }

    generate(documents: LangiumDocument[], options: GenerateOptions): TextDocument[] {
        return documents.flatMap((document) => this.generateDocument(document, options));
    }

    private generateDocument(document: LangiumDocument, options: GenerateOptions): TextDocument[] {
        return [];
    }
}

export interface GenerateOptions {
    destination: URI;
}
