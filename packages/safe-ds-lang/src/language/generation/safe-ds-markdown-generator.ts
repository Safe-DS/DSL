import { SafeDsServices } from '../safe-ds-module.js';
import { LangiumDocument, URI, UriUtils } from 'langium';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
    isSdsAnnotation,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsModule,
    isSdsPipeline,
    isSdsSchema,
    isSdsSegment,
    SdsAnnotation,
    SdsClass,
    SdsEnum,
    SdsFunction,
    SdsModuleMember,
    SdsSchema,
    SdsSegment,
} from '../generated/ast.js';
import { getModuleMembers, getPackageName, isPrivate } from '../helpers/nodeProperties.js';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';

const INDENTATION = '    ';

export class SafeDsMarkdownGenerator {
    private readonly documentationProvider: SafeDsDocumentationProvider;

    constructor(services: SafeDsServices) {
        this.documentationProvider = services.documentation.DocumentationProvider;
    }

    generate(documents: LangiumDocument[], options: GenerateOptions): TextDocument[] {
        const details = documents.flatMap((document) => this.generateDetailsForDocument(document, options));
        const summary = this.generateSummary(details, options);

        return [...details, summary];
    }

    private generateDetailsForDocument(document: LangiumDocument, options: GenerateOptions): TextDocument[] {
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return [];
        }

        return getModuleMembers(root).flatMap((member) => this.generateDetailsForModuleMember(member, options));
    }

    private generateDetailsForModuleMember(node: SdsModuleMember, options: GenerateOptions): TextDocument[] {
        const content = this.describeModuleMember(node, options);
        if (content === undefined) {
            return [];
        }

        const uri = this.uriForModuleMember(node, options).toString();
        return [TextDocument.create(uri, 'md', 0, content)];
    }

    /**
     * Returns a Markdown description for the given module member. If the member should not be documented, `undefined`
     * is returned.
     */
    private describeModuleMember(node: SdsModuleMember, options: GenerateOptions): string | undefined {
        if (isPrivate(node)) {
            // Private declarations cannot be used outside their module, so they are not documented
            return undefined;
        }

        if (isSdsAnnotation(node)) {
            return this.describeAnnotation(node, options);
        } else if (isSdsClass(node)) {
            return this.describeClass(node, options);
        } else if (isSdsEnum(node)) {
            return this.describeEnum(node, options);
        } else if (isSdsFunction(node)) {
            return this.describeFunction(node, options);
        } else if (isSdsPipeline(node)) {
            // Pipelines cannot be called, so they are not documented
            return undefined;
        } else if (isSdsSchema(node)) {
            return this.describeSchema(node, options);
        } else if (isSdsSegment(node)) {
            return this.describeSegment(node, options);
        } else {
            /* c8 ignore next 2 */
            throw new Error(`Unsupported module member type: ${node.$type}`);
        }
    }

    private describeAnnotation(node: SdsAnnotation, options: GenerateOptions): string {
        // TODO
        return 'Annotation details';
    }

    private describeClass(node: SdsClass, options: GenerateOptions): string {
        // TODO
        const description = this.documentationProvider.getDescription(node);
        const since = this.documentationProvider.getSince(node);
        return `Class details\n\n${description}\n\n${since}`;
    }

    private describeEnum(node: SdsEnum, options: GenerateOptions): string {
        // TODO
        return 'Enum details';
    }

    private describeFunction(node: SdsFunction, options: GenerateOptions): string {
        // TODO
        return 'Function details';
    }

    private describeSchema(node: SdsSchema, options: GenerateOptions): string {
        // TODO
        return 'Schema details';
    }

    private describeSegment(node: SdsSegment, options: GenerateOptions): string | undefined {
        // TODO
        return 'Segment details';
    }

    private uriForModuleMember(node: SdsModuleMember, options: GenerateOptions): URI {
        const packageName = getPackageName(node) ?? '';
        const name = node.name;

        return UriUtils.joinPath(options.destination, packageName.replaceAll(/\./gu, '/'), `${name}.md`);
    }

    private generateSummary(details: TextDocument[], options: GenerateOptions): TextDocument {
        const uri = UriUtils.joinPath(options.destination, 'SUMMARY.md').toString();

        const summary = this.buildSummary(
            options.destination,
            details.map((document) => URI.parse(document.uri)),
        );
        const content = this.describeSummary('', summary);

        return TextDocument.create(uri, 'md', 0, content);
    }

    private buildSummary(root: URI, uris: URI[]): Summary {
        const result: Summary = { children: new Map(), leaves: [] };

        for (const uri of uris) {
            const segments = UriUtils.relative(root, uri).replace(/\.md$/u, '').split('/');

            let current = result;
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i]!;

                if (i === segments.length - 1) {
                    current.leaves.push(segment);
                } else {
                    if (!current.children.has(segment)) {
                        current.children.set(segment, { children: new Map(), leaves: [] });
                    }
                    current = current.children.get(segment)!;
                }
            }
        }

        return result;
    }

    private describeSummary(root: string, summary: Summary): string {
        let result = '';

        // Describe inner nodes
        Array.from(summary.children)
            .sort(([key1], [key2]) => key1.localeCompare(key2))
            .forEach(([key, value]) => {
                let newRoot: string;
                if (root === '') {
                    newRoot = key;
                } else {
                    newRoot = `${root}/${key}`;
                }

                result += `- ${key}\n`;
                result += this.indent(this.describeSummary(newRoot, value));
                result += '\n';
            });

        // Describe leaves
        summary.leaves
            .sort((name1, name2) => name1.localeCompare(name2))
            .forEach((leaf) => {
                let href: string;
                if (root === '') {
                    href = `${leaf}.md`;
                } else {
                    href = `${root}/${leaf}.md`;
                }

                result += `- [${leaf}](${href})\n`;
            });

        return result;
    }

    private indent(text: string): string {
        return text
            .trim()
            .split('\n')
            .map((line) => `${INDENTATION}${line}`)
            .join('\n');
    }
}

export interface GenerateOptions {
    destination: URI;
}

interface Summary {
    children: Map<string, Summary>;
    leaves: string[];
}
