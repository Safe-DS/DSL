import { SafeDsServices } from '../safe-ds-module.js';
import { AstUtils, LangiumDocument, URI, UriUtils } from 'langium';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
    isSdsAnnotation,
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsModule,
    isSdsPipeline,
    isSdsSchema,
    isSdsSegment,
    SdsAnnotation,
    SdsAttribute,
    SdsClass,
    SdsClassMember,
    SdsDeclaration,
    SdsEnum,
    SdsEnumVariant,
    SdsFunction,
    SdsModuleMember,
    SdsParameter,
    SdsResult,
    SdsSchema,
    SdsSegment,
    SdsTypeParameter,
} from '../generated/ast.js';
import {
    getClassMembers,
    getColumns,
    getEnumVariants,
    getModuleMembers,
    getPackageName,
    getParameters,
    getParentTypes,
    getQualifiedName,
    getResults,
    getTypeParameters,
    isInternal,
    isPrivate,
    isStatic,
} from '../helpers/nodeProperties.js';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { isEmpty } from '../../helpers/collections.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { NamedType, Type, TypeParameterType } from '../typing/model.js';
import { expandToString } from 'langium/generate';

const INDENTATION = '    ';

export class SafeDsMarkdownGenerator {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly documentationProvider: SafeDsDocumentationProvider;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.builtinAnnotations = services.builtins.Annotations;
        this.documentationProvider = services.documentation.DocumentationProvider;
        this.typeComputer = services.types.TypeComputer;
    }

    generate(documents: LangiumDocument[], options: GenerateOptions): TextDocument[] {
        const knownUris = new Set(documents.map((document) => document.uri.toString()));
        const details = documents.flatMap((document) => this.generateDetailsForDocument(document, knownUris, options));
        const summary = this.generateSummary(details, options);

        return [...details, summary];
    }

    private generateDetailsForDocument(
        document: LangiumDocument,
        knownUris: Set<string>,
        options: GenerateOptions,
    ): TextDocument[] {
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return [];
        }

        return getModuleMembers(root).flatMap((member) =>
            this.generateDetailsForModuleMember(member, knownUris, options),
        );
    }

    private generateDetailsForModuleMember(
        node: SdsModuleMember,
        knownUris: Set<string>,
        options: GenerateOptions,
    ): TextDocument[] {
        const content = this.describeModuleMember(node, knownUris);
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
    private describeModuleMember(node: SdsModuleMember, knownUris: Set<string>): string | undefined {
        if (isPrivate(node)) {
            // Private declarations cannot be used outside their module, so they are not documented
            return undefined;
        }

        const level = 1;

        if (isSdsAnnotation(node)) {
            return this.describeAnnotation(node, level, knownUris);
        } else if (isSdsClass(node)) {
            return this.describeClass(node, level, knownUris);
        } else if (isSdsEnum(node)) {
            return this.describeEnum(node, level, knownUris);
        } else if (isSdsFunction(node)) {
            return this.describeFunction(node, level, knownUris);
        } else if (isSdsPipeline(node)) {
            // Pipelines cannot be called, so they are not documented
            return undefined;
        } else if (isSdsSchema(node)) {
            return this.describeSchema(node, level, knownUris);
        } else if (isSdsSegment(node)) {
            return this.describeSegment(node, level, knownUris);
        } else {
            /* c8 ignore next 2 */
            throw new Error(`Unsupported module member type: ${node.$type}`);
        }
    }

    /**
     * Returns a Markdown description for the given class member. If the member should not be documented, `undefined`
     * is returned.
     */
    private describeClassMember(node: SdsClassMember, level: number, knownUris: Set<string>): string | undefined {
        if (isSdsAttribute(node)) {
            return this.describeAttribute(node, level, knownUris);
        } else if (isSdsClass(node)) {
            return this.describeClass(node, level, knownUris);
        } else if (isSdsEnum(node)) {
            return this.describeEnum(node, level, knownUris);
        } else if (isSdsFunction(node)) {
            return this.describeFunction(node, level, knownUris);
        } else {
            /* c8 ignore next 2 */
            throw new Error(`Unsupported class member type: ${node.$type}`);
        }
    }

    private describeAnnotation(node: SdsAnnotation, level: number, knownUris: Set<string>): string {
        let result = this.renderPreamble(node, level, 'annotation');

        // Parameters
        const parameters = this.renderParameters(getParameters(node), knownUris);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeAttribute(node: SdsAttribute, level: number, knownUris: Set<string>): string {
        const keyword = isStatic(node) ? 'static attr' : 'attr';
        let result = this.renderPreamble(node, level, 'attribute', keyword);

        // Type
        const type = this.typeComputer.computeType(node.type);
        result += `\n**Type:** ${this.renderType(type, knownUris)}\n`;

        return result;
    }

    private describeClass(node: SdsClass, level: number, knownUris: Set<string>): string {
        const keyword = node.parameterList ? 'class' : 'abstract class';
        let result = this.renderPreamble(node, level, 'class', keyword);

        // Parent type
        const parentTypes = getParentTypes(node);
        if (!isEmpty(parentTypes)) {
            const firstParentType = this.renderType(this.typeComputer.computeType(parentTypes[0]), knownUris);
            result += `\n**Parent type:** ${firstParentType}\n`;
        }

        // Parameters
        const parameters = this.renderParameters(getParameters(node), knownUris);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Type parameters
        const typeParameters = this.renderTypeParameters(getTypeParameters(node), knownUris);
        if (typeParameters) {
            result += `\n**Type parameters:**\n\n${typeParameters}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        // Members
        getClassMembers(node).forEach((member) => {
            result += `\n${this.describeClassMember(member, level + 1, knownUris)}`;
        });

        return result;
    }

    private describeEnum(node: SdsEnum, level: number, knownUris: Set<string>): string {
        let result = this.renderPreamble(node, level, 'enum');

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        // Enum variants
        getEnumVariants(node).forEach((variant) => {
            result += `\n${this.describeEnumVariant(variant, level + 1, knownUris)}`;
        });

        return result;
    }

    private describeEnumVariant(node: SdsEnumVariant, level: number, knownUris: Set<string>): string {
        let result = this.renderPreamble(node, level, 'enum variant', '');

        // Parameters
        const parameters = this.renderParameters(getParameters(node), knownUris);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        return result;
    }

    private describeFunction(node: SdsFunction, level: number, knownUris: Set<string>): string {
        const keyword = isStatic(node) ? 'static attr' : 'attr';
        let result = this.renderPreamble(node, level, 'function', keyword);

        // Parameters
        const parameters = this.renderParameters(getParameters(node), knownUris);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Results
        const results = this.renderResults(getResults(node.resultList), knownUris);
        if (results) {
            result += `\n**Results:**\n\n${results}`;
        }

        // Type parameters
        const typeParameters = this.renderTypeParameters(getTypeParameters(node), knownUris);
        if (typeParameters) {
            result += `\n**Type parameters:**\n\n${typeParameters}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeSchema(node: SdsSchema, level: number, knownUris: Set<string>): string {
        let result = this.renderPreamble(node, level, 'schema');

        // Columns
        const columns = getColumns(node);
        if (!isEmpty(columns)) {
            result += '\n**Columns:**\n\n';
            result += '| Name | Type |\n';
            result += '|------|------|\n';

            for (const column of columns) {
                const name = column.columnName.value;
                const type = this.typeComputer.computeType(column.columnType);

                result += `| \`${name}\` | ${this.renderType(type, knownUris)} |\n`;
            }
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeSegment(node: SdsSegment, level: number, knownUris: Set<string>): string {
        const keyword = isInternal(node) ? 'internal segment' : 'segment';
        let result = this.renderPreamble(node, level, 'segment', keyword);

        // Parameters
        const parameters = this.renderParameters(getParameters(node), knownUris);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Results
        const results = this.renderResults(getResults(node.resultList), knownUris);
        if (results) {
            result += `\n**Results:**\n\n${results}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private renderPreamble(node: SdsDeclaration, level: number, kind: string, keyword: string = kind): string {
        let result = this.renderHeading(node, level, keyword) + '\n';

        const deprecationWarning = this.renderDeprecationWarning(node, kind);
        if (deprecationWarning) {
            result += `\n${deprecationWarning}\n`;
        }

        const description = this.documentationProvider.getDescription(node);
        if (description) {
            result += `\n${description}\n`;
        }

        return result;
    }

    private renderHeading(node: SdsDeclaration, level: number, keyword: string): string {
        let result = '#'.repeat(Math.min(level, 6));
        result += this.renderMaturity(node);

        if (keyword) {
            result += ` \`#!sds ${keyword}\``;
        }

        result += ` ${node.name}`;
        result += ` {#${getQualifiedName(node)} data-toc-label='${node.name}'}`;
        return result;
    }

    private renderMaturity(node: SdsDeclaration): string {
        if (this.builtinAnnotations.callsDeprecated(node)) {
            return ' :warning:{ title="Deprecated" }';
        } else if (this.builtinAnnotations.callsExperimental(node)) {
            return ' :test-tube:{ title="Experimental" }';
        } else {
            return '';
        }
    }

    private renderDeprecationWarning(node: SdsDeclaration, keyword: string): string {
        const deprecationInfo = this.builtinAnnotations.getDeprecationInfo(node);
        if (!deprecationInfo) {
            return '';
        }

        let result = '!!! warning "Deprecated"\n\n';
        result += `    This ${keyword} is deprecated`;

        if (deprecationInfo.sinceVersion) {
            result += ` since version **${deprecationInfo.sinceVersion}**`;
        }
        if (deprecationInfo.removalVersion) {
            result += ` and will be removed in version **${deprecationInfo.removalVersion}**`;
        }
        result += '.\n\n';

        if (deprecationInfo.alternative) {
            result += this.indent(`* **Alternative:** ${deprecationInfo.alternative}`) + `\n`;
        }
        if (deprecationInfo.reason) {
            result += this.indent(`* **Reason:** ${deprecationInfo.reason}`) + `\n`;
        }

        return result.trimEnd();
    }

    private renderParameters(nodes: SdsParameter[], knownUris: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Type | Description | Default |\n';
        result += '|------|------|-------------|---------|\n';

        for (const parameter of nodes) {
            const name = `\`${parameter.name}\``;
            const type = this.renderType(this.typeComputer.computeType(parameter.type), knownUris);
            const description = this.documentationProvider.getDescription(parameter) ?? '-';
            const defaultValue = parameter.defaultValue?.$cstNode
                ? `\`#!sds ${parameter.defaultValue.$cstNode.text}\``
                : '-';

            result += `| ${name} | ${type} | ${description} | ${defaultValue} |\n`;
        }

        return result;
    }

    private renderResults(nodes: SdsResult[], knownUris: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Type | Description |\n';
        result += '|------|------|-------------|\n';

        for (const node of nodes) {
            const name = `\`${node.name}\``;
            const type = this.renderType(this.typeComputer.computeType(node.type), knownUris);
            const description = this.documentationProvider.getDescription(node) ?? '-';

            result += `| ${name} | ${type} | ${description} |\n`;
        }

        return result;
    }

    private renderTypeParameters(nodes: SdsTypeParameter[], knownUris: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Upper Bound | Description | Default |\n';
        result += '|------|-------------|-------------|---------|\n';

        for (const node of nodes) {
            const name = `\`${node.name}\``;
            const upperBound = this.renderType(this.typeComputer.computeUpperBound(node), knownUris);
            const description = this.documentationProvider.getDescription(node) ?? '-';
            const defaultValue = node.defaultValue
                ? this.renderType(this.typeComputer.computeType(node.defaultValue), knownUris)
                : '-';

            result += `| ${name} | ${upperBound} | ${description} | ${defaultValue} |\n`;
        }

        return result;
    }

    private renderType(type: Type, knownUris: Set<string>): string {
        if (type instanceof NamedType && !(type instanceof TypeParameterType)) {
            const documentUri = AstUtils.getDocument(type.declaration).uri.toString();
            if (knownUris.has(documentUri)) {
                return `[\`#!sds ${type}\`][${getQualifiedName(type.declaration)}]`;
            }
        }

        return `\`#!sds ${type}\``;
    }

    private renderSourceCode(node: SdsDeclaration): string {
        const startLine = node.$cstNode?.range?.start?.line;
        const text = node.$cstNode?.text;
        if (!text || !startLine) {
            return '';
        }

        const fileName = AstUtils.getDocument(node).uri.path.split('/').pop();

        let result = `??? quote "Source code in \`${fileName}\`"\n\n`;
        result += this.indent(expandToString`
            \`\`\`sds linenums="${startLine + 1}"
            ${text}
            \`\`\`
        `);

        return result + '\n';
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
