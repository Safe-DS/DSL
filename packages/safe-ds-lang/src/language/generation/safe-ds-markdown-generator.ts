import { SafeDsServices } from '../safe-ds-module.js';
import { AstUtils, LangiumDocument, stream, URI, UriUtils } from 'langium';
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
    Class,
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
    isImplementedDeclaration,
    isInternal,
    isPrivate,
    isStatic,
} from '../helpers/nodeProperties.js';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { isEmpty } from '../../helpers/collections.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import { NamedType, Type, TypeVariable } from '../typing/model.js';
import path from 'path';
import { addLinePrefix, removeLinePrefix } from '../../helpers/strings.js';
import { expandToStringLF } from 'langium/generate';
import { SafeDsClassHierarchy } from '../typing/safe-ds-class-hierarchy.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SafeDsPackageManager } from '../workspace/safe-ds-package-manager.js';

const INDENTATION = '    ';
const LIB = path.join('packages', 'safe-ds-lang', 'lib', 'resources');
const SRC = path.join('packages', 'safe-ds-lang', 'src', 'resources');

export class SafeDsMarkdownGenerator {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly builtinClasses: SafeDsClasses;
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly documentationProvider: SafeDsDocumentationProvider;
    private readonly typeComputer: SafeDsTypeComputer;
    private readonly packages: SafeDsPackageManager;

    constructor(services: SafeDsServices) {
        this.builtinAnnotations = services.builtins.Annotations;
        this.builtinClasses = services.builtins.Classes;
        this.classHierarchy = services.typing.ClassHierarchy;
        this.documentationProvider = services.documentation.DocumentationProvider;
        this.typeComputer = services.typing.TypeComputer;
        this.packages = services.workspace.PackageManager;
    }

    generate(documents: LangiumDocument[], options: GenerateOptions): TextDocument[] {
        const knownPaths = new Set(documents.map((document) => document.uri.fsPath));
        const details = documents.flatMap((document) => this.generateDetailsForDocument(document, knownPaths, options));
        const summary = this.generateSummary(details, options);

        return [...details, summary];
    }

    private generateDetailsForDocument(
        document: LangiumDocument,
        knownPaths: Set<string>,
        options: GenerateOptions,
    ): TextDocument[] {
        const root = document.parseResult.value;
        if (!isSdsModule(root)) {
            /* c8 ignore next 2 */
            return [];
        }

        return getModuleMembers(root).flatMap((member) =>
            this.generateDetailsForModuleMember(member, knownPaths, options),
        );
    }

    private generateDetailsForModuleMember(
        node: SdsModuleMember,
        knownPaths: Set<string>,
        options: GenerateOptions,
    ): TextDocument[] {
        const content = this.describeModuleMember(node, knownPaths);
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
    private describeModuleMember(node: SdsModuleMember, knownPaths: Set<string>): string | undefined {
        if (isPrivate(node)) {
            // Private declarations cannot be used outside their module, so they are not documented
            return undefined;
        }

        const state = { level: 1, knownPaths };

        if (isSdsAnnotation(node)) {
            return this.describeAnnotation(node, state);
        } else if (isSdsClass(node)) {
            return this.describeClass(node, state);
        } else if (isSdsEnum(node)) {
            return this.describeEnum(node, state);
        } else if (isSdsFunction(node)) {
            return this.describeFunction(node, state);
        } else if (isSdsPipeline(node)) {
            // Pipelines cannot be called, so they are not documented
            return undefined;
        } else if (isSdsSchema(node)) {
            return this.describeSchema(node, state);
        } else if (isSdsSegment(node)) {
            return this.describeSegment(node, state);
        } else {
            /* c8 ignore next 2 */
            throw new Error(`Unsupported module member type: ${node.$type}`);
        }
    }

    /**
     * Returns a Markdown description for the given class member. If the member should not be documented, `undefined`
     * is returned.
     */
    private describeClassMember(node: SdsClassMember, state: DetailsState): string | undefined {
        if (isSdsAttribute(node)) {
            return this.describeAttribute(node, state);
        } else if (isSdsClass(node)) {
            return this.describeClass(node, state);
        } else if (isSdsEnum(node)) {
            return this.describeEnum(node, state);
        } else if (isSdsFunction(node)) {
            return this.describeFunction(node, state);
        } else {
            /* c8 ignore next 2 */
            throw new Error(`Unsupported class member type: ${node.$type}`);
        }
    }

    private describeAnnotation(node: SdsAnnotation, state: DetailsState): string {
        let result = this.renderPreamble(node, state, 'annotation');

        // Parameters
        const parameters = this.renderParameters(getParameters(node), state.knownPaths);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Targets
        const targets = this.builtinAnnotations
            .streamValidTargets(node)
            .map((it) => it.name)
            .toArray()
            .sort();

        if (!isEmpty(targets)) {
            result += '\n**Targets:**\n\n';
            targets.forEach((target) => {
                result += `- \`${target}\`\n`;
            });
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeAttribute(node: SdsAttribute, state: DetailsState): string {
        const keyword = isStatic(node) ? 'static attr' : 'attr';
        let result = this.renderPreamble(node, state, 'attribute', keyword);

        // Type
        const type = this.typeComputer.computeType(node.type);
        result += `\n**Type:** ${this.renderType(type, state.knownPaths)}\n`;

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        return result;
    }

    private describeClass(node: SdsClass, state: DetailsState): string {
        const keyword = node.parameterList ? 'class' : 'abstract class';
        let result = this.renderPreamble(node, state, 'class', keyword);

        // Parent type
        const parentTypes = getParentTypes(node);
        if (!isEmpty(parentTypes)) {
            const firstParentType = this.renderType(this.typeComputer.computeType(parentTypes[0]), state.knownPaths);
            result += `\n**Parent type:** ${firstParentType}\n`;
        }

        // Parameters
        const parameters = this.renderParameters(getParameters(node), state.knownPaths);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Type parameters
        const typeParameters = this.renderTypeParameters(getTypeParameters(node), state.knownPaths);
        if (typeParameters) {
            result += `\n**Type parameters:**\n\n${typeParameters}`;
        }

        // Direct subclasses
        const subclasses = this.renderSubclasses(node, state);
        if (!isEmpty(subclasses)) {
            result += `\n**Inheritors:**\n\n${subclasses}`;
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        // Class members
        result += this.renderClassMembers(node, state);

        return result;
    }

    private renderSubclasses(node: SdsClass, state: DetailsState) {
        let result = '';

        // The actual builtins in the lib/ folder take precedence over anything else loaded in the workspace. This
        // means, we cannot find subclasses when we generate documentation for the src/ folder. We, thus, find the
        // corresponding builtin first and compute its subclasses. We need to de-duplicate the subclasses, as there
        // might be copies in the lib/ and the src/ folder.
        //
        let context = node;
        const packageName = getPackageName(context);
        if (packageName?.startsWith('safeds')) {
            const description = this.packages
                .getDeclarationsInPackage(packageName, { nodeType: SdsClass })
                .find((it) => it.name === node.name);

            if (isSdsClass(description?.node)) {
                context = description.node;
            }
        }

        const directSubclasses = this.classHierarchy
            .streamDirectSubclasses(context)
            .distinct((it) => it.name)
            .toArray()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((it) => this.renderType(this.typeComputer.computeType(it), state.knownPaths));

        if (!isEmpty(directSubclasses)) {
            directSubclasses.forEach((subclass) => {
                result += `- ${subclass}\n`;
            });
        }
        return result;
    }

    private renderClassMembers(node: SdsClass, state: DetailsState) {
        let result = '';

        const staticMembers = getClassMembers(node)
            .filter((it) => isStatic(it))
            .sort((a, b) => a.name.localeCompare(b.name));

        const ownInstanceMembers = getClassMembers(node).filter((it) => !isStatic(it));
        const inheritedInstanceMembers = this.classHierarchy
            .streamProperSuperclasses(node)
            .filter((it) => it !== this.builtinClasses.Any)
            .flatMap(getClassMembers)
            .filter((it) => !isStatic(it));
        const instanceMembers = stream(ownInstanceMembers, inheritedInstanceMembers)
            .distinct((it) => it.name)
            .toArray()
            .sort((a, b) => a.name.localeCompare(b.name));

        [
            // Instance members
            ...instanceMembers.filter((it) => isSdsAttribute(it)),
            ...instanceMembers.filter((it) => isSdsFunction(it)),

            // Static members
            ...staticMembers.filter((it) => isSdsAttribute(it)),
            ...staticMembers.filter((it) => isSdsFunction(it)),
            ...staticMembers.filter((it) => isSdsClass(it)),
            ...staticMembers.filter((it) => isSdsEnum(it)),
        ].forEach((member) => {
            const newState = {
                ...state,
                level: state.level + 1,
                contextClass: node,
            };

            result += `\n${this.describeClassMember(member, newState)}`;
        });

        return result;
    }

    private describeEnum(node: SdsEnum, state: DetailsState): string {
        let result = this.renderPreamble(node, state, 'enum');

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        // Enum variants
        getEnumVariants(node)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((variant) => {
                const newState = {
                    level: state.level + 1,
                    knownPaths: state.knownPaths,
                };

                result += `\n${this.describeEnumVariant(variant, newState)}`;
            });

        return result;
    }

    private describeEnumVariant(node: SdsEnumVariant, state: DetailsState): string {
        let result = this.renderPreamble(node, state, 'enum variant', '');

        // Parameters
        const parameters = this.renderParameters(getParameters(node), state.knownPaths);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        return result;
    }

    private describeFunction(node: SdsFunction, state: DetailsState): string {
        const keyword = isStatic(node) ? 'static fun' : 'fun';
        let result = this.renderPreamble(node, state, 'function', keyword);

        // Parameters
        const parameters = this.renderParameters(getParameters(node), state.knownPaths);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Results
        const results = this.renderResults(getResults(node.resultList), state.knownPaths);
        if (results) {
            result += `\n**Results:**\n\n${results}`;
        }

        // Type parameters
        const typeParameters = this.renderTypeParameters(getTypeParameters(node), state.knownPaths);
        if (typeParameters) {
            result += `\n**Type parameters:**\n\n${typeParameters}`;
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeSchema(node: SdsSchema, state: DetailsState): string {
        let result = this.renderPreamble(node, state, 'schema');

        // Columns
        const columns = getColumns(node);
        if (!isEmpty(columns)) {
            result += '\n**Columns:**\n\n';
            result += '| Name | Type |\n';
            result += '|------|------|\n';

            for (const column of columns) {
                const name = column.columnName.value;
                const type = this.typeComputer.computeType(column.columnType);

                result += `| \`${name}\` | ${this.renderType(type, state.knownPaths)} |\n`;
            }
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private describeSegment(node: SdsSegment, state: DetailsState): string {
        const keyword = isInternal(node) ? 'internal segment' : 'segment';
        let result = this.renderPreamble(node, state, 'segment', keyword);

        // Parameters
        const parameters = this.renderParameters(getParameters(node), state.knownPaths);
        if (parameters) {
            result += `\n**Parameters:**\n\n${parameters}`;
        }

        // Results
        const results = this.renderResults(getResults(node.resultList), state.knownPaths);
        if (results) {
            result += `\n**Results:**\n\n${results}`;
        }

        // Examples
        const examples = this.renderExamples(node);
        if (examples) {
            result += `\n**Examples:**\n\n${examples}`;
        }

        // Source code
        const sourceCode = this.renderSourceCode(node);
        if (sourceCode) {
            result += `\n${sourceCode}`;
        }

        return result;
    }

    private renderPreamble(node: SdsDeclaration, state: DetailsState, kind: string, keyword: string = kind): string {
        let result = this.renderFrontMatter(node);

        result += this.renderHeading(node, state, keyword) + '\n';

        const deprecationWarning = this.renderDeprecationWarning(node, kind);
        if (deprecationWarning) {
            result += `\n${deprecationWarning}\n`;
        }
        const description = this.renderDescription(node);
        if (description) {
            result += `\n${description}\n`;
        }

        return result;
    }

    private renderFrontMatter(node: SdsDeclaration): string {
        if (isSdsClass(node) && Class.isOnlyForTyping(node)) {
            return `---\nsearch:\n  boost: 0.5\n---\n\n`;
        }

        return '';
    }

    private renderHeading(node: SdsDeclaration, state: DetailsState, keyword: string): string {
        let result = '#'.repeat(Math.min(state.level, 6));
        result += this.renderMaturity(node);

        if (keyword) {
            result += ` \`#!sds ${keyword}\``;
        }

        result += ` ${node.name}`;
        result += ` {#${this.getId(node, state)} data-toc-label='${node.name}'}`;
        return result;
    }

    private getId(node: SdsDeclaration, state: DetailsState): string {
        if (state.contextClass) {
            return `${getQualifiedName(state.contextClass)}.${node.name}`;
        } else {
            return getQualifiedName(node);
        }
    }

    private renderMaturity(node: SdsDeclaration): string {
        if (this.builtinAnnotations.callsDeprecated(node)) {
            return ' :warning:{ title="Deprecated" }';
        } else if (this.builtinAnnotations.callsExperimental(node)) {
            return ' :test_tube:{ title="Experimental" }';
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
            result += indent(`- **Alternative:** ${deprecationInfo.alternative}`) + `\n`;
        }
        if (deprecationInfo.reason) {
            result += indent(`- **Reason:** ${deprecationInfo.reason}`) + `\n`;
        }

        return result.trimEnd();
    }

    private renderDescription(node: SdsDeclaration) {
        return this.documentationProvider.getDescription(node, (target, display) => {
            return `[${display}][${getQualifiedName(target)}]`;
        });
    }

    private renderParameters(nodes: SdsParameter[], knownPaths: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Type | Description | Default |\n';
        result += '|------|------|-------------|---------|\n';

        for (const parameter of nodes) {
            const name = `\`${parameter.name}\``;
            const type = this.renderType(this.typeComputer.computeType(parameter.type), knownPaths);
            const description = this.renderDescription(parameter) ?? '-';
            const defaultValue = parameter.defaultValue?.$cstNode
                ? `\`#!sds ${parameter.defaultValue.$cstNode.text}\``
                : '-';

            result += `| ${name} | ${type} | ${description} | ${defaultValue} |\n`;
        }

        return result;
    }

    private renderResults(nodes: SdsResult[], knownPaths: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Type | Description |\n';
        result += '|------|------|-------------|\n';

        for (const node of nodes) {
            const name = `\`${node.name}\``;
            const type = this.renderType(this.typeComputer.computeType(node.type), knownPaths);
            const description = this.renderDescription(node) ?? '-';

            result += `| ${name} | ${type} | ${description} |\n`;
        }

        return result;
    }

    private renderTypeParameters(nodes: SdsTypeParameter[], knownPaths: Set<string>): string {
        if (isEmpty(nodes)) {
            return '';
        }

        let result = '| Name | Upper Bound | Description | Default |\n';
        result += '|------|-------------|-------------|---------|\n';

        for (const node of nodes) {
            const name = `\`${node.name}\``;
            const upperBound = this.renderType(this.typeComputer.computeUpperBound(node), knownPaths);
            const description = this.renderDescription(node) ?? '-';
            const defaultValue = node.defaultValue
                ? this.renderType(this.typeComputer.computeType(node.defaultValue), knownPaths)
                : '-';

            result += `| ${name} | ${upperBound} | ${description} | ${defaultValue} |\n`;
        }

        return result;
    }

    private renderType(type: Type, knownPaths: Set<string>): string {
        if (type instanceof NamedType && !(type instanceof TypeVariable)) {
            const realPath = AstUtils.getDocument(type.declaration).uri.fsPath;
            // When generating documentation for the standard library declarations in the `src` folder, references are
            // resolved to the `lib` folder. To still create links, we also check this augmented path.
            const srcPath = realPath.replace(LIB, SRC);

            if (knownPaths.has(realPath) || knownPaths.has(srcPath)) {
                return `[\`${type}\`][${getQualifiedName(type.declaration)}]`;
            }
        }

        return `\`#!sds ${type}\``;
    }

    private renderExamples(node: SdsDeclaration): string {
        const examples = this.documentationProvider.getExamples(node);
        if (isEmpty(examples)) {
            return '';
        }

        const result = examples
            .map(
                (example) =>
                    expandToStringLF`
                        \`\`\`sds
                        ${example}
                        \`\`\`
                    `,
            )
            .join('\n');

        return result + '\n';
    }

    private renderSourceCode(node: SdsDeclaration): string {
        const cstNode = node.$cstNode;
        if (!cstNode) {
            /* c8 ignore next 2 */
            return '';
        }

        const startLine = cstNode.range.start.line;
        const firstLineIndent = AstUtils.getDocument(node).textDocument.getText({
            start: { line: startLine, character: 0 },
            end: cstNode.range.start,
        });

        const text = removeLinePrefix(cstNode.text, firstLineIndent);
        const fileName = AstUtils.getDocument(node).uri.path.split('/').pop();
        const kind = isImplementedDeclaration(node) ? 'Implementation' : 'Stub';

        let result = `??? quote "${kind} code in \`${fileName}\`"\n\n`;
        result += indent(`\`\`\`sds linenums="${startLine + 1}"\n${text}\n\`\`\``);

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

        const frontMatter = `---\nsearch:\n  exclude: true\n---\n\n`;
        const content = frontMatter + this.describeSummary('', summary);

        return TextDocument.create(uri, 'md', 0, content);
    }

    private buildSummary(root: URI, uris: URI[]): Summary {
        const rootPath = root.fsPath;
        const result: Summary = { children: new Map(), leaves: [] };

        for (const uri of uris) {
            // `URIUtils.relative` has trouble with different capitalization of drive letters on Windows, so we use
            // `path.relative` instead.

            const uriPath = uri.fsPath;
            const segments = path.relative(rootPath, uriPath).replace(/\.md$/u, '').split(/[/\\]/u);

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
                result += indent(this.describeSummary(newRoot, value));
                result += '\n';
            });

        // Describe leaves
        summary.leaves
            .sort((name1, name2) => name1.localeCompare(name2))
            .forEach((leaf) => {
                let href: string;
                if (root === '') {
                    /* c8 ignore next 2 */
                    href = `${leaf}.md`;
                } else {
                    href = `${root}/${leaf}.md`;
                }

                result += `- [${leaf}](${href})\n`;
            });

        return result;
    }
}

export interface GenerateOptions {
    destination: URI;
}

/**
 * The state of the details generation process.
 */
interface DetailsState {
    /**
     * The current nesting level.
     */
    level: number;

    /**
     * The paths of the documents to generate documentation for. Used to decide whether to create links to other
     * documents.
     */
    knownPaths: Set<string>;

    /**
     * The class for which the documentation is generated. Used to derive section IDs for inherited members.
     */
    contextClass?: SdsClass;
}

interface Summary {
    children: Map<string, Summary>;
    leaves: string[];
}

const indent = (text: string): string => {
    return addLinePrefix(text, INDENTATION);
};
