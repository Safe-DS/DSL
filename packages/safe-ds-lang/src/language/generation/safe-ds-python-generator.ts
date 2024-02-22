import {
    CompositeGeneratorNode,
    expandToNode,
    expandTracedToNode,
    findRootNode,
    getContainerOfType,
    getDocument,
    joinToNode,
    joinTracedToNode,
    LangiumDocument,
    NL,
    streamAllContents,
    toStringAndTrace,
    TraceRegion,
    traceToNode,
    TreeStreamImpl,
    URI,
} from 'langium';
import path from 'path';
import { SourceMapGenerator, StartOfSourceMap } from 'source-map';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { groupBy, isEmpty } from '../../helpers/collections.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAbstractResult,
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsExpressionStatement,
    isSdsFunction,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsList,
    isSdsMap,
    isSdsMemberAccess,
    isSdsModule,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsPrefixOperation,
    isSdsQualifiedImport,
    isSdsReference,
    isSdsSegment,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringPart,
    isSdsTemplateStringStart,
    isSdsWildcard,
    isSdsWildcardImport,
    isSdsYield,
    SdsArgument,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsCall,
    SdsDeclaration,
    SdsExpression,
    SdsModule,
    SdsParameter,
    SdsParameterList,
    SdsPipeline,
    SdsPlaceholder,
    SdsSegment,
    SdsStatement,
} from '../generated/ast.js';
import { isInStubFile, isStubFile } from '../helpers/fileExtensions.js';
import { IdManager } from '../helpers/idManager.js';
import {
    getAbstractResults,
    getArguments,
    getAssignees,
    getImportedDeclarations,
    getImports,
    getModuleMembers,
    getParameters,
    getPlaceholderByName,
    getStatements,
    Parameter,
    streamBlockLambdaResults,
} from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../partialEvaluation/model.js';
import { SafeDsPartialEvaluator } from '../partialEvaluation/safe-ds-partial-evaluator.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsPurityComputer } from '../purity/safe-ds-purity-computer.js';
import { FileRead, ImpurityReason } from '../purity/model.js';

export const CODEGEN_PREFIX = '__gen_';
const BLOCK_LAMBDA_PREFIX = `${CODEGEN_PREFIX}block_lambda_`;
const BLOCK_LAMBDA_RESULT_PREFIX = `${CODEGEN_PREFIX}block_lambda_result_`;
const YIELD_PREFIX = `${CODEGEN_PREFIX}yield_`;

const RUNNER_PACKAGE = 'safeds_runner';
const PYTHON_INDENT = '    ';

const SPACING = new CompositeGeneratorNode(NL, NL);

const UTILITY_EAGER_OR: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_or`,
    code: expandToNode`def ${CODEGEN_PREFIX}eager_or(left_operand: bool, right_operand: bool) -> bool:`
        .appendNewLine()
        .indent({ indentedChildren: ['return left_operand or right_operand'], indentation: PYTHON_INDENT }),
};

const UTILITY_EAGER_AND: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_and`,
    code: expandToNode`def ${CODEGEN_PREFIX}eager_and(left_operand: bool, right_operand: bool) -> bool:`
        .appendNewLine()
        .indent({ indentedChildren: ['return left_operand and right_operand'], indentation: PYTHON_INDENT }),
};

const UTILITY_EAGER_ELVIS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}eager_elvis`,
    code: expandToNode`def ${CODEGEN_PREFIX}eager_elvis(left_operand: ${CODEGEN_PREFIX}T, right_operand: ${CODEGEN_PREFIX}T) -> ${CODEGEN_PREFIX}T:`
        .appendNewLine()
        .indent({
            indentedChildren: ['return left_operand if left_operand is not None else right_operand'],
            indentation: PYTHON_INDENT,
        }),
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

const UTILITY_NULL_SAFE_CALL: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_call`,
    code: expandToNode`def ${CODEGEN_PREFIX}null_safe_call(receiver: Any, callable: Callable[[], ${CODEGEN_PREFIX}T]) -> ${CODEGEN_PREFIX}T | None:`
        .appendNewLine()
        .indent({
            indentedChildren: ['return callable() if receiver is not None else None'],
            indentation: PYTHON_INDENT,
        }),
    imports: [
        { importPath: 'typing', declarationName: 'Any' },
        { importPath: 'typing', declarationName: 'Callable' },
    ],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

const UTILITY_NULL_SAFE_INDEXED_ACCESS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_indexed_access`,
    code: expandToNode`def ${CODEGEN_PREFIX}null_safe_indexed_access(receiver: Any, index: Any) -> ${CODEGEN_PREFIX}T | None:`
        .appendNewLine()
        .indent({
            indentedChildren: ['return receiver[index] if receiver is not None else None'],
            indentation: PYTHON_INDENT,
        }),
    imports: [{ importPath: 'typing', declarationName: 'Any' }],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

const UTILITY_NULL_SAFE_MEMBER_ACCESS: UtilityFunction = {
    name: `${CODEGEN_PREFIX}null_safe_member_access`,
    code: expandToNode`def ${CODEGEN_PREFIX}null_safe_member_access(receiver: Any, member_name: str) -> ${CODEGEN_PREFIX}T | None:`
        .appendNewLine()
        .indent({
            indentedChildren: ['return getattr(receiver, member_name) if receiver is not None else None'],
            indentation: PYTHON_INDENT,
        }),
    imports: [{ importPath: 'typing', declarationName: 'Any' }],
    typeVariables: [`${CODEGEN_PREFIX}T`],
};

export class SafeDsPythonGenerator {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;
    private readonly purityComputer: SafeDsPurityComputer;

    constructor(services: SafeDsServices) {
        this.builtinAnnotations = services.builtins.Annotations;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.purityComputer = services.purity.PurityComputer;
    }

    generate(document: LangiumDocument, generateOptions: GenerateOptions): TextDocument[] {
        const node = document.parseResult.value;

        // Do not generate stub files
        if (isStubFile(document) || !isSdsModule(node)) {
            return [];
        }

        const name = path.parse(document.uri.fsPath).name;
        const pythonModuleName = this.builtinAnnotations.getPythonModule(node);
        const packagePath = pythonModuleName === undefined ? node.name.split('.') : [pythonModuleName];
        const parentDirectoryPath = path.join(generateOptions.destination!.fsPath, ...packagePath);

        const generatedFiles = new Map<string, string>();
        const generatedModule = this.generateModule(node, generateOptions);
        const { text, trace } = toStringAndTrace(generatedModule);
        const pythonOutputPath = `${path.join(parentDirectoryPath, this.formatGeneratedFileName(name))}.py`;
        if (generateOptions.createSourceMaps) {
            generatedFiles.set(
                `${pythonOutputPath}.map`,
                this.generateSourceMap(document, text, trace, this.formatGeneratedFileName(name)),
            );
        }
        generatedFiles.set(pythonOutputPath, text);
        for (const pipeline of getModuleMembers(node).filter(isSdsPipeline)) {
            const entryPointFilename = `${path.join(
                parentDirectoryPath,
                `${this.formatGeneratedFileName(name)}_${this.getPythonNameOrDefault(pipeline)}`,
            )}.py`;
            const entryPointContent = expandTracedToNode(pipeline)`from .${this.formatGeneratedFileName(
                name,
            )} import ${this.getPythonNameOrDefault(
                pipeline,
            )}\n\nif __name__ == '__main__':\n${PYTHON_INDENT}${this.getPythonNameOrDefault(
                pipeline,
            )}()`.appendNewLine();
            const generatedPipelineEntry = toStringAndTrace(entryPointContent);
            generatedFiles.set(entryPointFilename, generatedPipelineEntry.text);
        }

        return Array.from(generatedFiles.entries()).map(([fsPath, content]) =>
            TextDocument.create(URI.file(fsPath).toString(), 'py', 0, content),
        );
    }

    private generateSourceMap(
        document: LangiumDocument,
        generatedText: String,
        trace: TraceRegion,
        generatedFileName: string,
    ): string {
        const sourceTextFull = document.textDocument.getText();
        const mapper: SourceMapGenerator = new SourceMapGenerator(<StartOfSourceMap>{
            file: `${generatedFileName}.py`,
        });
        // Use only the filename (and extension) in the source map
        const inputPath = path.parse(document.uri.fsPath);
        const inputFile = `${inputPath.name}${inputPath.ext}`;

        new TreeStreamImpl(trace, (r) => r.children ?? [], { includeRoot: true }).forEach((r) => {
            if (!r.sourceRegion || !r.targetRegion || r.children?.[0]?.targetRegion.offset === r.targetRegion.offset) {
                return;
            }
            const sourceStart = r.sourceRegion.range?.start;
            const targetStart = r.targetRegion.range?.start;
            const sourceEnd = r.sourceRegion?.range?.end;
            const sourceText =
                sourceEnd && sourceTextFull.length >= r.sourceRegion.end
                    ? sourceTextFull.substring(r.sourceRegion.offset, r.sourceRegion.end)
                    : /* c8 ignore next */
                      '';
            if (sourceStart && targetStart) {
                mapper.addMapping({
                    original: { line: sourceStart.line + 1, column: sourceStart.character },
                    generated: { line: targetStart.line + 1, column: targetStart.character },
                    source: inputFile,
                    name: /^[_a-zA-Z][_a-zA-Z0-9]*$/u.test(sourceText) ? sourceText.toLowerCase() : undefined,
                });
            }
            const targetEnd = r.targetRegion?.range?.end;
            const targetText =
                targetEnd && generatedText.length >= r.targetRegion.end
                    ? generatedText.substring(r.targetRegion.offset, r.targetRegion.end)
                    : /* c8 ignore next */
                      '';
            if (
                sourceEnd &&
                targetEnd &&
                !r.children &&
                sourceText &&
                targetText &&
                !/\s/u.test(sourceText) &&
                !/\s/u.test(targetText)
            ) {
                mapper.addMapping({
                    original: { line: sourceEnd.line + 1, column: sourceEnd.character },
                    generated: { line: targetEnd.line + 1, column: targetEnd.character },
                    source: inputFile,
                });
            }
        });
        return mapper.toString();
    }

    private getPythonModuleOrDefault(object: SdsModule) {
        return this.builtinAnnotations.getPythonModule(object) || object.name;
    }

    private getPythonNameOrDefault(object: SdsDeclaration) {
        return this.builtinAnnotations.getPythonName(object) || object.name;
    }

    private getQualifiedNamePythonCompatible(node: SdsDeclaration | undefined): string | undefined {
        const segments = [];

        let current: SdsDeclaration | undefined = node;
        while (current) {
            const currentName = isSdsModule(current)
                ? this.getPythonModuleOrDefault(current)
                : this.getPythonNameOrDefault(current);
            if (currentName) {
                segments.unshift(currentName);
            }
            current = getContainerOfType(current.$container, isSdsDeclaration);
        }

        return segments.join('.');
    }

    private formatGeneratedFileName(baseName: string): string {
        return `gen_${this.sanitizeModuleNameForPython(baseName)}`;
    }

    sanitizeModuleNameForPython(moduleName: string): string {
        return moduleName.replaceAll('%2520', '_').replaceAll(/[ .-]/gu, '_').replaceAll(/\\W/gu, '');
    }

    private generateModule(module: SdsModule, generateOptions: GenerateOptions): CompositeGeneratorNode {
        const importSet = new Map<String, ImportData>();
        const utilitySet = new Set<UtilityFunction>();
        const typeVariableSet = new Set<string>();
        const segments = getModuleMembers(module)
            .filter(isSdsSegment)
            .map((segment) => this.generateSegment(segment, importSet, utilitySet, typeVariableSet, generateOptions));
        const pipelines = getModuleMembers(module)
            .filter(isSdsPipeline)
            .map((pipeline) =>
                this.generatePipeline(pipeline, importSet, utilitySet, typeVariableSet, generateOptions),
            );
        const imports = this.generateImports(Array.from(importSet.values()));
        const output = new CompositeGeneratorNode();
        output.trace(module);
        if (imports.length > 0) {
            output.append('# Imports ----------------------------------------------------------------------');
            output.appendNewLine();
            output.appendNewLine();
            output.append(joinToNode(imports, (importDecl) => importDecl, { separator: NL }));
            output.appendNewLine();
        }
        if (typeVariableSet.size > 0) {
            output.appendNewLineIf(imports.length > 0);
            output.append('# Type variables ---------------------------------------------------------------');
            output.appendNewLine();
            output.appendNewLine();
            output.append(joinToNode(typeVariableSet, (typeVar) => `${typeVar} = TypeVar("${typeVar}")`));
            output.appendNewLine();
        }
        if (utilitySet.size > 0) {
            output.appendNewLineIf(imports.length > 0 || typeVariableSet.size > 0);
            output.append('# Utils ------------------------------------------------------------------------');
            output.appendNewLine();
            output.appendNewLine();
            output.append(joinToNode(utilitySet, (importDecl) => importDecl.code, { separator: SPACING }));
            output.appendNewLine();
        }
        if (segments.length > 0) {
            output.appendNewLineIf(imports.length > 0 || typeVariableSet.size > 0 || utilitySet.size > 0);
            output.append('# Segments ---------------------------------------------------------------------');
            output.appendNewLine();
            output.appendNewLine();
            output.append(joinToNode(segments, (segment) => segment, { separator: SPACING }));
            output.appendNewLine();
        }
        if (pipelines.length > 0) {
            output.appendNewLineIf(
                imports.length > 0 || typeVariableSet.size > 0 || utilitySet.size > 0 || segments.length > 0,
            );
            output.append('# Pipelines --------------------------------------------------------------------');
            output.appendNewLine();
            output.appendNewLine();
            output.append(joinToNode(pipelines, (pipeline) => pipeline, { separator: SPACING }));
            output.appendNewLine();
        }
        return output;
    }

    private generateSegment(
        segment: SdsSegment,
        importSet: Map<String, ImportData>,
        utilitySet: Set<UtilityFunction>,
        typeVariableSet: Set<string>,
        generateOptions: GenerateOptions,
    ): CompositeGeneratorNode {
        const infoFrame = new GenerationInfoFrame(
            importSet,
            utilitySet,
            typeVariableSet,
            false,
            undefined,
            generateOptions.disableRunnerIntegration,
        );
        const segmentResult = segment.resultList?.results || [];
        const segmentBlock = this.generateBlock(segment.body, infoFrame);
        if (segmentResult.length !== 0) {
            segmentBlock.appendNewLine();
            segmentBlock.append(
                expandTracedToNode(segment.resultList!)`return ${joinTracedToNode(segment.resultList!, 'results')(
                    segmentResult,
                    (result) => expandTracedToNode(result)`${YIELD_PREFIX}${result.name}`,
                    { separator: ', ' },
                )}`,
            );
        }
        return expandTracedToNode(segment)`def ${traceToNode(
            segment,
            'name',
        )(this.getPythonNameOrDefault(segment))}(${this.generateParameters(segment.parameterList, infoFrame)}):`
            .appendNewLine()
            .indent({ indentedChildren: [segmentBlock], indentation: PYTHON_INDENT });
    }

    private generateParameters(
        parameters: SdsParameterList | undefined,
        frame: GenerationInfoFrame,
    ): CompositeGeneratorNode | undefined {
        if (!parameters) {
            /* c8 ignore next 2 */
            return undefined;
        }
        return joinTracedToNode(parameters, 'parameters')(
            parameters?.parameters || [],
            (param) => this.generateParameter(param, frame),
            { separator: ', ' },
        );
    }

    private generateParameter(
        parameter: SdsParameter,
        frame: GenerationInfoFrame,
        defaultValue: boolean = true,
    ): CompositeGeneratorNode {
        return expandTracedToNode(parameter)`${traceToNode(parameter, 'name')(this.getPythonNameOrDefault(parameter))}${
            defaultValue && parameter.defaultValue !== undefined
                ? expandToNode`=${this.generateExpression(parameter.defaultValue, frame)}`
                : ''
        }`;
    }

    private generatePipeline(
        pipeline: SdsPipeline,
        importSet: Map<String, ImportData>,
        utilitySet: Set<UtilityFunction>,
        typeVariableSet: Set<string>,
        generateOptions: GenerateOptions,
    ): CompositeGeneratorNode {
        const infoFrame = new GenerationInfoFrame(
            importSet,
            utilitySet,
            typeVariableSet,
            true,
            generateOptions.targetPlaceholder,
            generateOptions.disableRunnerIntegration,
        );
        return expandTracedToNode(pipeline)`def ${traceToNode(
            pipeline,
            'name',
        )(this.getPythonNameOrDefault(pipeline))}():`
            .appendNewLine()
            .indent({ indentedChildren: [this.generateBlock(pipeline.body, infoFrame)], indentation: PYTHON_INDENT });
    }

    private generateImports(importSet: ImportData[]): string[] {
        const qualifiedImports = importSet
            .filter((importStmt) => importStmt.declarationName === undefined)
            .sort((a, b) => a.importPath.localeCompare(b.importPath))
            .map(this.generateQualifiedImport);
        const groupedImports = groupBy(
            importSet.filter((importStmt) => importStmt.declarationName !== undefined),
            (importStmt) => importStmt.importPath,
        )
            .toArray()
            .sort(([key1, _value1], [key2, _value2]) => key1.localeCompare(key2));
        const declaredImports: string[] = [];
        for (const [key, value] of groupedImports) {
            const importedDecls =
                value
                    ?.filter((importData) => importData !== undefined)
                    .sort((a, b) => a.declarationName!.localeCompare(b.declarationName!))
                    .map((localValue) =>
                        localValue.alias !== undefined
                            ? `${localValue.declarationName} as ${localValue.alias}`
                            : localValue.declarationName!,
                    ) || [];
            declaredImports.push(`from ${key} import ${[...new Set(importedDecls)].join(', ')}`);
        }
        return [...new Set(qualifiedImports), ...new Set(declaredImports)];
    }

    private generateQualifiedImport(importStmt: ImportData): string {
        if (importStmt.alias === undefined) {
            return `import ${importStmt.importPath}`;
        } else {
            /* c8 ignore next 2 */
            return `import ${importStmt.importPath} as ${importStmt.alias}`;
        }
    }

    private generateBlock(
        block: SdsBlock,
        frame: GenerationInfoFrame,
        generateLambda: boolean = false,
    ): CompositeGeneratorNode {
        const targetPlaceholder = getPlaceholderByName(block, frame.targetPlaceholder);
        let statements = getStatements(block).filter((stmt) => this.purityComputer.statementDoesSomething(stmt));
        if (targetPlaceholder) {
            statements = this.getStatementsNeededForPartialExecution(targetPlaceholder, statements);
        }
        if (statements.length === 0) {
            return traceToNode(block)('pass');
        }
        return joinTracedToNode(block, 'statements')(
            statements,
            (stmt) => this.generateStatement(stmt, frame, generateLambda),
            {
                separator: NL,
            },
        )!;
    }

    private getStatementsNeededForPartialExecution(
        targetPlaceholder: SdsPlaceholder,
        statementsWithEffect: SdsStatement[],
    ): SdsStatement[] {
        // Find assignment of placeholder, to search used placeholders and impure dependencies
        const assignment = getContainerOfType(targetPlaceholder, isSdsAssignment);
        if (!assignment || !assignment.expression) {
            /* c8 ignore next 2 */
            throw new Error(`No assignment for placeholder: ${targetPlaceholder.name}`);
        }
        // All collected referenced placeholders that are needed for calculating the target placeholder. An expression in the assignment will always exist here
        const referencedPlaceholders = new Set<SdsPlaceholder>(
            streamAllContents(assignment.expression!)
                .filter(isSdsReference)
                .filter((reference) => isSdsPlaceholder(reference.target.ref))
                .map((reference) => <SdsPlaceholder>reference.target.ref!)
                .toArray(),
        );
        const impurityReasons = new Set<ImpurityReason>(this.purityComputer.getImpurityReasonsForStatement(assignment));
        const collectedStatements: SdsStatement[] = [assignment];
        for (const prevStatement of statementsWithEffect.reverse()) {
            // Statements after the target assignment can always be skipped
            if (prevStatement.$containerIndex! >= assignment.$containerIndex!) {
                continue;
            }
            const prevStmtImpurityReasons: ImpurityReason[] =
                this.purityComputer.getImpurityReasonsForStatement(prevStatement);
            if (
                // Placeholder is relevant
                (isSdsAssignment(prevStatement) &&
                    getAssignees(prevStatement)
                        .filter(isSdsPlaceholder)
                        .some((prevPlaceholder) => referencedPlaceholders.has(prevPlaceholder))) ||
                // Impurity is relevant
                prevStmtImpurityReasons.some((pastReason) =>
                    Array.from(impurityReasons).some((futureReason) =>
                        pastReason.canAffectFutureImpurityReason(futureReason),
                    ),
                )
            ) {
                collectedStatements.push(prevStatement);
                // Collect all referenced placeholders
                if (isSdsExpressionStatement(prevStatement) || isSdsAssignment(prevStatement)) {
                    streamAllContents(prevStatement.expression!)
                        .filter(isSdsReference)
                        .filter((reference) => isSdsPlaceholder(reference.target.ref))
                        .map((reference) => <SdsPlaceholder>reference.target.ref!)
                        .forEach((prevPlaceholder) => {
                            referencedPlaceholders.add(prevPlaceholder);
                        });
                }
                // Collect impurity reasons
                prevStmtImpurityReasons.forEach((prevReason) => {
                    impurityReasons.add(prevReason);
                });
            }
        }
        // Get all statements in sorted order
        return collectedStatements.reverse();
    }

    private generateStatement(
        statement: SdsStatement,
        frame: GenerationInfoFrame,
        generateLambda: boolean,
    ): CompositeGeneratorNode {
        const blockLambdaCode: CompositeGeneratorNode[] = [];
        if (isSdsAssignment(statement)) {
            if (statement.expression) {
                for (const lambda of streamAllContents(statement.expression).filter(isSdsBlockLambda)) {
                    blockLambdaCode.push(this.generateBlockLambda(lambda, frame));
                }
            }
            blockLambdaCode.push(this.generateAssignment(statement, frame, generateLambda));
            return joinTracedToNode(statement)(blockLambdaCode, (stmt) => stmt, {
                separator: NL,
            })!;
        } else if (isSdsExpressionStatement(statement)) {
            for (const lambda of streamAllContents(statement.expression).filter(isSdsBlockLambda)) {
                blockLambdaCode.push(this.generateBlockLambda(lambda, frame));
            }
            blockLambdaCode.push(this.generateExpression(statement.expression, frame));
            return joinTracedToNode(statement)(blockLambdaCode, (stmt) => stmt, {
                separator: NL,
            })!;
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown SdsStatement: ${statement}`);
    }

    private generateAssignment(
        assignment: SdsAssignment,
        frame: GenerationInfoFrame,
        generateLambda: boolean,
    ): CompositeGeneratorNode {
        const requiredAssignees = isSdsCall(assignment.expression)
            ? getAbstractResults(this.nodeMapper.callToCallable(assignment.expression)).length
            : /* c8 ignore next */
              1;
        const assignees = getAssignees(assignment);
        if (assignees.some((value) => !isSdsWildcard(value))) {
            const actualAssignees = assignees.map(this.generateAssignee);
            const assignmentStatements = [];
            if (requiredAssignees === actualAssignees.length) {
                assignmentStatements.push(
                    expandTracedToNode(assignment)`${joinToNode(actualAssignees, (actualAssignee) => actualAssignee, {
                        separator: ', ',
                    })} = ${this.generateExpression(assignment.expression!, frame)}`,
                );
            } else {
                // Add wildcards to match given results
                assignmentStatements.push(
                    expandTracedToNode(assignment)`${joinToNode(
                        actualAssignees.concat(Array(requiredAssignees - actualAssignees.length).fill('_')),
                        (actualAssignee) => actualAssignee,
                        { separator: ', ' },
                    )} = ${this.generateExpression(assignment.expression!, frame)}`,
                );
            }
            if (frame.isInsidePipeline && !generateLambda && !frame.disableRunnerIntegration) {
                for (const savableAssignment of assignees.filter(isSdsPlaceholder)) {
                    // should always be SdsPlaceholder
                    frame.addImport({ importPath: RUNNER_PACKAGE });
                    assignmentStatements.push(
                        expandTracedToNode(
                            savableAssignment,
                        )`${RUNNER_PACKAGE}.save_placeholder('${savableAssignment.name}', ${savableAssignment.name})`,
                    );
                }
            }
            return joinTracedToNode(assignment)(assignmentStatements, (stmt) => stmt, {
                separator: NL,
            })!;
        } else {
            return traceToNode(assignment)(this.generateExpression(assignment.expression!, frame));
        }
    }

    private generateAssignee(assignee: SdsAssignee): CompositeGeneratorNode {
        if (isSdsBlockLambdaResult(assignee)) {
            return expandTracedToNode(assignee)`${BLOCK_LAMBDA_RESULT_PREFIX}${traceToNode(
                assignee,
                'name',
            )(assignee.name)}`;
        } else if (isSdsPlaceholder(assignee)) {
            return traceToNode(assignee)(assignee.name);
        } else if (isSdsWildcard(assignee)) {
            return traceToNode(assignee)('_');
        } else if (isSdsYield(assignee)) {
            return expandTracedToNode(assignee)`${YIELD_PREFIX}${traceToNode(
                assignee,
                'result',
            )(assignee.result?.ref?.name!)}`;
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown SdsAssignment: ${assignee.$type}`);
    }

    private generateBlockLambda(blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): CompositeGeneratorNode {
        const results = streamBlockLambdaResults(blockLambda).toArray();
        const lambdaBlock = this.generateBlock(blockLambda.body, frame, true);
        if (results.length !== 0) {
            lambdaBlock.appendNewLine();
            lambdaBlock.append(
                expandTracedToNode(blockLambda)`return ${joinToNode(
                    results,
                    (result) =>
                        expandTracedToNode(result)`${BLOCK_LAMBDA_RESULT_PREFIX}${traceToNode(
                            result,
                            'name',
                        )(result.name)}`,
                    { separator: ', ' },
                )}`,
            );
        }
        return expandTracedToNode(blockLambda)`def ${frame.getUniqueLambdaBlockName(
            blockLambda,
        )}(${this.generateParameters(blockLambda.parameterList, frame)}):`
            .appendNewLine()
            .indent({
                indentedChildren: [lambdaBlock],
                indentation: PYTHON_INDENT,
            });
    }

    private generateExpression(expression: SdsExpression, frame: GenerationInfoFrame): CompositeGeneratorNode {
        if (isSdsTemplateStringPart(expression)) {
            if (isSdsTemplateStringStart(expression)) {
                return expandTracedToNode(expression)`${this.formatStringSingleLine(expression.value)}{ `;
            } else if (isSdsTemplateStringInner(expression)) {
                return expandTracedToNode(expression)` }${this.formatStringSingleLine(expression.value)}{ `;
            } else if (isSdsTemplateStringEnd(expression)) {
                return expandTracedToNode(expression)` }${this.formatStringSingleLine(expression.value)}`;
            }
        }

        if (!this.purityComputer.expressionHasSideEffects(expression)) {
            const partiallyEvaluatedNode = this.partialEvaluator.evaluate(expression);
            if (partiallyEvaluatedNode instanceof BooleanConstant) {
                return traceToNode(expression)(partiallyEvaluatedNode.value ? 'True' : 'False');
            } else if (partiallyEvaluatedNode instanceof IntConstant) {
                return traceToNode(expression)(String(partiallyEvaluatedNode.value));
            } else if (partiallyEvaluatedNode instanceof FloatConstant) {
                const floatValue = partiallyEvaluatedNode.value;
                return traceToNode(expression)(Number.isInteger(floatValue) ? `${floatValue}.0` : String(floatValue));
            } else if (partiallyEvaluatedNode === NullConstant) {
                return traceToNode(expression)('None');
            } else if (partiallyEvaluatedNode instanceof StringConstant) {
                return expandTracedToNode(expression)`'${this.formatStringSingleLine(partiallyEvaluatedNode.value)}'`;
            }
        }

        // Handled after constant expressions: EnumVariant, List, Map
        if (isSdsTemplateString(expression)) {
            return expandTracedToNode(expression)`f'${joinTracedToNode(expression, 'expressions')(
                expression.expressions,
                (expr) => this.generateExpression(expr, frame),
                { separator: '' },
            )}'`;
        } else if (isSdsMap(expression)) {
            return expandTracedToNode(expression)`{${joinTracedToNode(expression, 'entries')(
                expression.entries,
                (entry) =>
                    expandTracedToNode(entry)`${traceToNode(
                        entry,
                        'key',
                    )(this.generateExpression(entry.key, frame))}: ${traceToNode(
                        entry,
                        'value',
                    )(this.generateExpression(entry.value, frame))}`,
                { separator: ', ' },
            )}}`;
        } else if (isSdsList(expression)) {
            return expandTracedToNode(expression)`[${joinTracedToNode(expression, 'elements')(
                expression.elements,
                (value) => this.generateExpression(value, frame),
                { separator: ', ' },
            )}]`;
        } else if (isSdsBlockLambda(expression)) {
            return traceToNode(expression)(frame.getUniqueLambdaBlockName(expression));
        } else if (isSdsCall(expression)) {
            const callable = this.nodeMapper.callToCallable(expression);
            const sortedArgs = this.sortArguments(getArguments(expression));
            const receiver = this.generateExpression(expression.receiver, frame);
            let call: CompositeGeneratorNode | undefined = undefined;

            // Memoize constructor or function call
            if (isSdsFunction(callable) || isSdsClass(callable)) {
                if (isSdsFunction(callable)) {
                    const pythonCall = this.builtinAnnotations.getPythonCall(callable);
                    if (pythonCall) {
                        let thisParam: CompositeGeneratorNode | undefined = undefined;
                        if (isSdsMemberAccess(expression.receiver)) {
                            thisParam = this.generateExpression(expression.receiver.receiver, frame);
                        }
                        const argumentsMap = this.getArgumentsMap(getArguments(expression), frame);
                        call = this.generatePythonCall(expression, pythonCall, argumentsMap, frame, thisParam);
                    }
                }
                if (!call && this.isMemoizableCall(expression) && !frame.disableRunnerIntegration) {
                    let thisParam: CompositeGeneratorNode | undefined = undefined;
                    if (isSdsMemberAccess(expression.receiver)) {
                        thisParam = this.generateExpression(expression.receiver.receiver, frame);
                    }
                    call = this.generateMemoizedCall(expression, sortedArgs, frame, thisParam);
                }
            }

            if (!call) {
                call = this.generatePlainCall(expression, sortedArgs, frame);
            }

            if (expression.isNullSafe) {
                frame.addUtility(UTILITY_NULL_SAFE_CALL);
                return expandTracedToNode(expression)`${traceToNode(
                    expression,
                    'isNullSafe',
                )(UTILITY_NULL_SAFE_CALL.name)}(${receiver}, lambda: ${call})`;
            } else {
                return call;
            }
        } else if (isSdsExpressionLambda(expression)) {
            return expandTracedToNode(expression)`lambda ${this.generateParameters(
                expression.parameterList,
                frame,
            )}: ${this.generateExpression(expression.result, frame)}`;
        } else if (isSdsInfixOperation(expression)) {
            const leftOperand = this.generateExpression(expression.leftOperand, frame);
            const rightOperand = this.generateExpression(expression.rightOperand, frame);
            switch (expression.operator) {
                case 'or':
                    frame.addUtility(UTILITY_EAGER_OR);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'operator',
                    )(UTILITY_EAGER_OR.name)}(${leftOperand}, ${rightOperand})`;
                case 'and':
                    frame.addUtility(UTILITY_EAGER_AND);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'operator',
                    )(UTILITY_EAGER_AND.name)}(${leftOperand}, ${rightOperand})`;
                case '?:':
                    frame.addUtility(UTILITY_EAGER_ELVIS);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'operator',
                    )(UTILITY_EAGER_ELVIS.name)}(${leftOperand}, ${rightOperand})`;
                case '===':
                    return expandTracedToNode(expression)`(${leftOperand}) ${traceToNode(
                        expression,
                        'operator',
                    )('is')} (${rightOperand})`;
                case '!==':
                    return expandTracedToNode(expression)`(${leftOperand}) ${traceToNode(
                        expression,
                        'operator',
                    )('is not')} (${rightOperand})`;
                default:
                    return expandTracedToNode(expression)`(${leftOperand}) ${traceToNode(
                        expression,
                        'operator',
                    )(expression.operator)} (${rightOperand})`;
            }
        } else if (isSdsIndexedAccess(expression)) {
            if (expression.isNullSafe) {
                frame.addUtility(UTILITY_NULL_SAFE_INDEXED_ACCESS);
                return expandTracedToNode(expression)`${traceToNode(
                    expression,
                    'isNullSafe',
                )(UTILITY_NULL_SAFE_INDEXED_ACCESS.name)}(${this.generateExpression(
                    expression.receiver,
                    frame,
                )}, ${this.generateExpression(expression.index, frame)})`;
            } else {
                return expandTracedToNode(expression)`${this.generateExpression(
                    expression.receiver,
                    frame,
                )}[${this.generateExpression(expression.index, frame)}]`;
            }
        } else if (isSdsMemberAccess(expression)) {
            const member = expression.member?.target.ref!;
            const receiver = this.generateExpression(expression.receiver, frame);
            if (isSdsEnumVariant(member)) {
                const enumMember = this.generateExpression(expression.member!, frame);
                const suffix = isSdsCall(expression.$container) ? '' : '()';
                return expandTracedToNode(expression)`${receiver}.${enumMember}${suffix}`;
            } else if (isSdsAbstractResult(member)) {
                const resultList = getAbstractResults(getContainerOfType(member, isSdsCallable));
                if (resultList.length === 1) {
                    return traceToNode(expression)(receiver);
                }
                const currentIndex = resultList.indexOf(member);
                return expandTracedToNode(expression)`${receiver}[${traceToNode(expression.member!)(
                    String(currentIndex),
                )}]`;
            } else {
                const memberExpression = this.generateExpression(expression.member!, frame);
                if (expression.isNullSafe) {
                    frame.addUtility(UTILITY_NULL_SAFE_MEMBER_ACCESS);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'isNullSafe',
                    )(UTILITY_NULL_SAFE_MEMBER_ACCESS.name)}(${receiver}, '${memberExpression}')`;
                } else {
                    return expandTracedToNode(expression)`${receiver}.${memberExpression}`;
                }
            }
        } else if (isSdsParenthesizedExpression(expression)) {
            return expandTracedToNode(expression)`${this.generateExpression(expression.expression, frame)}`;
        } else if (isSdsPrefixOperation(expression)) {
            const operand = this.generateExpression(expression.operand, frame);
            switch (expression.operator) {
                case 'not':
                    return expandTracedToNode(expression)`${traceToNode(expression, 'operator')('not')} (${operand})`;
                case '-':
                    return expandTracedToNode(expression)`${traceToNode(expression, 'operator')('-')}(${operand})`;
            }
        } else if (isSdsReference(expression)) {
            const declaration = expression.target.ref!;
            const referenceImport =
                this.getExternalReferenceNeededImport(expression, declaration) ||
                this.getInternalReferenceNeededImport(expression, declaration);
            frame.addImport(referenceImport);
            return traceToNode(expression)(referenceImport?.alias || this.getPythonNameOrDefault(declaration));
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown expression type: ${expression.$type}`);
    }

    private generatePlainCall(
        expression: SdsCall,
        sortedArgs: SdsArgument[],
        frame: GenerationInfoFrame,
    ): CompositeGeneratorNode {
        return expandTracedToNode(expression)`${this.generateExpression(expression.receiver, frame)}(${joinTracedToNode(
            expression.argumentList,
            'arguments',
        )(sortedArgs, (arg) => this.generateArgument(arg, frame), { separator: ', ' })})`;
    }

    private generatePythonCall(
        expression: SdsCall,
        pythonCall: string,
        argumentsMap: Map<string, CompositeGeneratorNode>,
        frame: GenerationInfoFrame,
        thisParam: CompositeGeneratorNode | undefined = undefined,
    ): CompositeGeneratorNode {
        if (thisParam) {
            argumentsMap.set('this', thisParam);
        }
        const splitRegex = /(\$[_a-zA-Z][_a-zA-Z0-9]*)/gu;
        const splitPythonCallDefinition = pythonCall.split(splitRegex);
        const generatedPythonCall = joinTracedToNode(expression)(
            splitPythonCallDefinition,
            (part) => {
                if (splitRegex.test(part)) {
                    return argumentsMap.get(part.substring(1))!;
                } else {
                    return part;
                }
            },
            { separator: '' },
        )!;
        // Non-memoizable calls can be directly generated
        if (!this.isMemoizableCall(expression) || frame.disableRunnerIntegration) {
            return generatedPythonCall;
        }
        frame.addImport({ importPath: RUNNER_PACKAGE });
        const hiddenParameters = this.getMemoizedCallHiddenParameters(expression, frame);
        const callable = this.nodeMapper.callToCallable(expression);
        const memoizedArgs = getParameters(callable).map(
            (parameter) => this.nodeMapper.callToParameterValue(expression, parameter)!,
        );
        return expandTracedToNode(
            expression,
        )`${RUNNER_PACKAGE}.memoized_call("${this.generateFullyQualifiedFunctionName(
            expression,
        )}", lambda *_ : ${generatedPythonCall}, [${joinTracedToNode(expression.argumentList, 'arguments')(
            memoizedArgs,
            (arg) => this.generateExpression(arg, frame),
            { separator: ', ' },
        )}], [${joinToNode(hiddenParameters, (param) => param, { separator: ', ' })}])`;
    }

    private isMemoizableCall(expression: SdsCall): boolean {
        const impurityReasons = this.purityComputer.getImpurityReasonsForExpression(expression);
        // If the file is not known, the call is not memoizable
        return !impurityReasons.some((reason) => !(reason instanceof FileRead) || reason.path === undefined);
    }

    private generateMemoizedCall(
        expression: SdsCall,
        sortedArgs: SdsArgument[],
        frame: GenerationInfoFrame,
        thisParam: CompositeGeneratorNode | undefined = undefined,
    ): CompositeGeneratorNode {
        frame.addImport({ importPath: RUNNER_PACKAGE });
        const hiddenParameters = this.getMemoizedCallHiddenParameters(expression, frame);
        const callable = this.nodeMapper.callToCallable(expression);
        const memoizedArgs = getParameters(callable).map(
            (parameter) => this.nodeMapper.callToParameterValue(expression, parameter)!,
        );
        // For a static function, the thisParam would be the class containing the function. We do not need to generate it in this case
        const generateThisParam = !isSdsFunction(callable) || (!callable.isStatic && thisParam);
        const containsOptionalArgs = sortedArgs.some((arg) =>
            Parameter.isOptional(this.nodeMapper.argumentToParameter(arg)),
        );
        const fullyQualifiedTargetName = this.generateFullyQualifiedFunctionName(expression);
        return expandTracedToNode(expression)`${RUNNER_PACKAGE}.memoized_call("${fullyQualifiedTargetName}", ${
            containsOptionalArgs ? 'lambda *_ : ' : ''
        }${
            containsOptionalArgs
                ? this.generatePlainCall(expression, sortedArgs, frame)
                : isSdsMemberAccess(expression.receiver) && isSdsCall(expression.receiver.receiver)
                  ? expandTracedToNode(expression.receiver)`${this.generateExpression(
                        expression.receiver.receiver.receiver,
                        frame,
                    )}.${this.generateExpression(expression.receiver.member!, frame)}`
                  : this.generateExpression(expression.receiver, frame)
        }, [${generateThisParam ? thisParam : ''}${
            generateThisParam && memoizedArgs.length > 0 ? ', ' : ''
        }${joinTracedToNode(expression.argumentList, 'arguments')(
            memoizedArgs,
            (arg) => this.generateExpression(arg, frame),
            {
                separator: ', ',
            },
        )}], [${joinToNode(hiddenParameters, (param) => param, { separator: ', ' })}])`;
    }

    private getMemoizedCallHiddenParameters(expression: SdsCall, frame: GenerationInfoFrame): CompositeGeneratorNode[] {
        const impurityReasons = this.purityComputer.getImpurityReasonsForExpression(expression);
        const hiddenParameters: CompositeGeneratorNode[] = [];
        for (const reason of impurityReasons) {
            if (reason instanceof FileRead) {
                if (typeof reason.path === 'string') {
                    hiddenParameters.push(
                        expandTracedToNode(expression)`${RUNNER_PACKAGE}.file_mtime('${reason.path}')`,
                    );
                } else if (isSdsParameter(reason.path)) {
                    const argument = this.nodeMapper
                        .parametersToArguments([reason.path], getArguments(expression))
                        .get(reason.path);
                    if (!argument) {
                        /* c8 ignore next 4 */
                        throw new Error(
                            'File Read impurity with dependency on parameter is present on call, but no argument has been provided.',
                        );
                    }
                    hiddenParameters.push(
                        expandTracedToNode(argument)`${RUNNER_PACKAGE}.file_mtime(${this.generateArgument(
                            argument,
                            frame,
                        )})`,
                    );
                }
            }
        }
        return hiddenParameters;
    }

    private generateFullyQualifiedFunctionName(expression: SdsCall): string {
        const callable = this.nodeMapper.callToCallable(expression);
        if (isSdsDeclaration(callable)) {
            const fullyQualifiedReferenceName = this.getQualifiedNamePythonCompatible(callable);
            if (fullyQualifiedReferenceName) {
                return fullyQualifiedReferenceName;
            }
        }
        /* c8 ignore next */
        throw new Error('Callable of provided call does not exist or is not a declaration.');
    }

    private getArgumentsMap(
        argumentList: SdsArgument[],
        frame: GenerationInfoFrame,
    ): Map<string, CompositeGeneratorNode> {
        const argumentsMap = new Map<string, CompositeGeneratorNode>();
        argumentList.reduce((map, value) => {
            map.set(this.nodeMapper.argumentToParameter(value)?.name!, this.generateArgument(value, frame));
            return map;
        }, argumentsMap);
        return argumentsMap;
    }

    private sortArguments(argumentList: SdsArgument[]): SdsArgument[] {
        // $containerIndex contains the index of the parameter in the receivers parameter list
        const parameters = argumentList.map((argument) => {
            return { par: this.nodeMapper.argumentToParameter(argument), arg: argument };
        });
        return parameters
            .slice()
            .filter((value) => value.par !== undefined)
            .sort((a, b) =>
                a.par !== undefined && b.par !== undefined ? a.par.$containerIndex! - b.par.$containerIndex! : 0,
            )
            .map((value) => value.arg);
    }

    private generateArgument(
        argument: SdsArgument,
        frame: GenerationInfoFrame,
        generateOptionalParameterName: boolean = true,
    ): CompositeGeneratorNode {
        const parameter = this.nodeMapper.argumentToParameter(argument);
        return expandTracedToNode(argument)`${
            parameter !== undefined && !Parameter.isRequired(parameter) && generateOptionalParameterName
                ? expandToNode`${this.generateParameter(parameter, frame, false)}=`
                : ''
        }${this.generateExpression(argument.value, frame)}`;
    }

    private getExternalReferenceNeededImport(
        expression: SdsExpression | undefined,
        declaration: SdsDeclaration | undefined,
    ): ImportData | undefined {
        if (!expression || !declaration) {
            /* c8 ignore next 2 */
            return undefined;
        }

        // Root Node is always a module.
        const currentModule = <SdsModule>findRootNode(expression);
        const targetModule = <SdsModule>findRootNode(declaration);
        for (const value of getImports(currentModule)) {
            // Verify same package
            if (value.package !== targetModule.name) {
                continue;
            }
            if (isSdsQualifiedImport(value)) {
                const importedDeclarations = getImportedDeclarations(value);
                for (const importedDeclaration of importedDeclarations) {
                    if (declaration === importedDeclaration.declaration?.ref) {
                        if (importedDeclaration.alias !== undefined) {
                            return {
                                importPath: this.getPythonModuleOrDefault(targetModule),
                                declarationName: importedDeclaration.declaration?.ref?.name,
                                alias: importedDeclaration.alias.alias,
                            };
                        } else {
                            return {
                                importPath: this.getPythonModuleOrDefault(targetModule),
                                declarationName: importedDeclaration.declaration?.ref?.name,
                            };
                        }
                    }
                }
            }
            if (isSdsWildcardImport(value)) {
                return {
                    importPath: this.getPythonModuleOrDefault(targetModule),
                    declarationName: declaration.name,
                };
            }
        }
        return undefined;
    }

    private getInternalReferenceNeededImport(
        expression: SdsExpression,
        declaration: SdsDeclaration,
    ): ImportData | undefined {
        // Root Node is always a module.
        const currentModule = <SdsModule>findRootNode(expression);
        const targetModule = <SdsModule>findRootNode(declaration);
        if (currentModule !== targetModule && !isInStubFile(targetModule)) {
            return {
                importPath: `${this.getPythonModuleOrDefault(targetModule)}.${this.formatGeneratedFileName(
                    this.getModuleFileBaseName(targetModule),
                )}`,
                declarationName: this.getPythonNameOrDefault(declaration),
            };
        }
        return undefined;
    }

    private getModuleFileBaseName(module: SdsModule): string {
        const filePath = getDocument(module).uri.fsPath;
        return path.basename(filePath, path.extname(filePath));
    }

    private formatStringSingleLine(value: string): string {
        return value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n');
    }
}

interface UtilityFunction {
    readonly name: string;
    readonly code: CompositeGeneratorNode;
    readonly imports?: ImportData[];
    readonly typeVariables?: string[];
}

interface ImportData {
    readonly importPath: string;
    readonly declarationName?: string;
    readonly alias?: string;
}

class GenerationInfoFrame {
    private readonly blockLambdaManager: IdManager<SdsBlockLambda>;
    private readonly importSet: Map<String, ImportData>;
    private readonly utilitySet: Set<UtilityFunction>;
    private readonly typeVariableSet: Set<string>;
    public readonly isInsidePipeline: boolean;
    public readonly targetPlaceholder: string | undefined;
    public readonly disableRunnerIntegration: boolean;

    constructor(
        importSet: Map<String, ImportData> = new Map<String, ImportData>(),
        utilitySet: Set<UtilityFunction> = new Set<UtilityFunction>(),
        typeVariableSet: Set<string> = new Set<string>(),
        insidePipeline: boolean = false,
        targetPlaceholder: string | undefined = undefined,
        disableRunnerIntegration: boolean = false,
    ) {
        this.blockLambdaManager = new IdManager<SdsBlockLambda>();
        this.importSet = importSet;
        this.utilitySet = utilitySet;
        this.typeVariableSet = typeVariableSet;
        this.isInsidePipeline = insidePipeline;
        this.targetPlaceholder = targetPlaceholder;
        this.disableRunnerIntegration = disableRunnerIntegration;
    }

    addImport(importData: ImportData | undefined) {
        if (importData) {
            const hashKey = JSON.stringify(importData);
            if (!this.importSet.has(hashKey)) {
                this.importSet.set(hashKey, importData);
            }
        }
    }

    addUtility(utilityFunction: UtilityFunction) {
        const imports = utilityFunction.imports || [];
        const typeVariables = utilityFunction.typeVariables || [];

        this.utilitySet.add(utilityFunction);
        for (const importData of imports) {
            this.addImport(importData);
        }

        if (!isEmpty(typeVariables)) {
            this.addImport({ importPath: 'typing', declarationName: 'TypeVar' });
        }

        for (const typeVariable of typeVariables) {
            this.typeVariableSet.add(typeVariable);
        }
    }

    getUniqueLambdaBlockName(lambda: SdsBlockLambda): string {
        return `${BLOCK_LAMBDA_PREFIX}${this.blockLambdaManager.assignId(lambda)}`;
    }
}

export interface GenerateOptions {
    destination: URI;
    createSourceMaps: boolean;
    targetPlaceholder: string | undefined;
    disableRunnerIntegration: boolean;
}
