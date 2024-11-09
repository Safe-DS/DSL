import { AstNode, AstUtils, LangiumDocument, TreeStreamImpl, URI } from 'langium';
import {
    CompositeGeneratorNode,
    expandToNode,
    expandTracedToNode,
    Generated,
    joinToNode,
    joinTracedToNode,
    NL,
    toStringAndTrace,
    TraceRegion,
    traceToNode,
} from 'langium/generate';
import path from 'path';
import { SourceMapGenerator, StartOfSourceMap } from 'source-map';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { groupBy, isEmpty } from '../../../helpers/collections.js';
import { SafeDsAnnotations } from '../../builtins/safe-ds-annotations.js';
import {
    isSdsAbstractCall,
    isSdsAbstractResult,
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCall,
    isSdsCallable,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsExpressionLambda,
    isSdsExpressionStatement,
    isSdsFunction,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsList,
    isSdsMap,
    isSdsMemberAccess,
    isSdsModule,
    isSdsOutputStatement,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsSegment,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringPart,
    isSdsTemplateStringStart,
    isSdsThis,
    isSdsTypeCast,
    isSdsWildcard,
    isSdsYield,
    SdsArgument,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsCall,
    SdsCallable,
    SdsClassMember,
    SdsDeclaration,
    SdsExpression,
    SdsExpressionLambda,
    SdsFunction,
    SdsLambda,
    SdsModule,
    SdsOutputStatement,
    SdsParameter,
    SdsParameterList,
    SdsPipeline,
    SdsReference,
    SdsSegment,
    SdsStatement,
} from '../../generated/ast.js';
import { isStubFile } from '../../helpers/fileExtensions.js';
import { IdManager } from '../../helpers/idManager.js';
import {
    getAbstractResults,
    getArguments,
    getAssignees,
    getModuleMembers,
    getParameters,
    getStatements,
    isStatic,
    Parameter,
    streamBlockLambdaResults,
} from '../../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../../helpers/safe-ds-node-mapper.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../../partialEvaluation/model.js';
import { SafeDsPartialEvaluator } from '../../partialEvaluation/safe-ds-partial-evaluator.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { SafeDsPurityComputer } from '../../purity/safe-ds-purity-computer.js';
import { FileRead } from '../../purity/model.js';
import { SafeDsTypeComputer } from '../../typing/safe-ds-type-computer.js';
import { NamedTupleType } from '../../typing/model.js';
import { getOutermostContainerOfType } from '../../helpers/astUtils.js';
import {
    eagerAnd,
    eagerElvis,
    eagerOr,
    nullSafeCall,
    nullSafeIndexedAccess,
    nullSafeMemberAccess,
    UtilityFunction,
} from './utilityFunctions.js';
import { CODEGEN_PREFIX } from './constants.js';
import { SafeDsSlicer } from '../../flow/safe-ds-slicer.js';
import { SafeDsTypeChecker } from '../../typing/safe-ds-type-checker.js';
import { SafeDsCoreTypes } from '../../typing/safe-ds-core-types.js';

const LAMBDA_PREFIX = `${CODEGEN_PREFIX}lambda_`;
const BLOCK_LAMBDA_RESULT_PREFIX = `${CODEGEN_PREFIX}block_lambda_result_`;
const OUTPUT_PREFIX = `${CODEGEN_PREFIX}output_`;
const PLACEHOLDER_PREFIX = `${CODEGEN_PREFIX}placeholder_`;
const RECEIVER_PREFIX = `${CODEGEN_PREFIX}receiver_`;
const YIELD_PREFIX = `${CODEGEN_PREFIX}yield_`;

const RUNNER_PACKAGE = 'safeds_runner';
const MEMOIZED_DYNAMIC_CALL = `${RUNNER_PACKAGE}.memoized_dynamic_call`;
const MEMOIZED_STATIC_CALL = `${RUNNER_PACKAGE}.memoized_static_call`;
const PYTHON_INDENT = '    ';

const SPACING = new CompositeGeneratorNode(NL, NL);

export class SafeDsPythonGenerator {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;
    private readonly purityComputer: SafeDsPurityComputer;
    private readonly slicer: SafeDsSlicer;
    private readonly typeChecker: SafeDsTypeChecker;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        this.builtinAnnotations = services.builtins.Annotations;
        this.coreTypes = services.typing.CoreTypes;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.purityComputer = services.purity.PurityComputer;
        this.slicer = services.flow.Slicer;
        this.typeChecker = services.typing.TypeChecker;
        this.typeComputer = services.typing.TypeComputer;
    }

    generate(document: LangiumDocument, options: GenerateOptions): TextDocument[] {
        const node = document.parseResult.value;

        // Do not generate stub files
        if (isStubFile(document) || !isSdsModule(node)) {
            return [];
        }

        const name = path.parse(document.uri.fsPath).name;
        const pythonModuleName = this.builtinAnnotations.getPythonModule(node);
        const packagePath = pythonModuleName === undefined ? node.name.split('.') : [pythonModuleName];
        const parentDirectoryPath = path.join(options.destination!.fsPath, ...packagePath);

        const generatedFiles = new Map<string, string>();
        const generatedModule = this.generateModule(node, options);
        const { text, trace } = toStringAndTrace(generatedModule);
        const pythonOutputPath = `${path.join(parentDirectoryPath, this.formatGeneratedFileName(name))}.py`;
        if (options.createSourceMaps) {
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
            current = AstUtils.getContainerOfType(current.$container, isSdsDeclaration);
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
    ): Generated {
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
    ): Generated | undefined {
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
    ): Generated {
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
    ): Generated {
        const targetStatements =
            typeof generateOptions.targetStatements === 'number'
                ? [generateOptions.targetStatements]
                : generateOptions.targetStatements;

        const infoFrame = new GenerationInfoFrame(
            importSet,
            utilitySet,
            typeVariableSet,
            true,
            targetStatements,
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
        // TODO: if there are no target statements, only generate code that causes side-effects
        let statements = getStatements(block).filter((stmt) => this.statementDoesSomething(stmt));
        if (frame.targetStatements) {
            const targetStatements = frame.targetStatements.flatMap((it) => {
                return getStatements(block)[it] ?? [];
            });
            if (!isEmpty(targetStatements)) {
                statements = this.slicer.computeBackwardSliceToTargets(statements, targetStatements);
            }
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

    /**
     * Returns whether the given statement does something. It must either
     *     - create a placeholder,
     *     - assign to a result, or
     *     - call a function that has side effects.
     *
     * @param node
     * The statement to check.
     */
    private statementDoesSomething(node: SdsStatement): boolean {
        if (isSdsAssignment(node)) {
            return (
                !getAssignees(node).every(isSdsWildcard) ||
                this.purityComputer.expressionHasSideEffects(node.expression)
            );
        } else if (isSdsExpressionStatement(node)) {
            return this.purityComputer.expressionHasSideEffects(node.expression);
        } else {
            return isSdsOutputStatement(node);
        }
    }

    private generateStatement(statement: SdsStatement, frame: GenerationInfoFrame, generateLambda: boolean): Generated {
        const result: Generated[] = [];

        if (isSdsAssignment(statement)) {
            const assignment = this.generateAssignment(statement, frame, generateLambda);
            result.push(...frame.getExtraStatements(), assignment);
        } else if (isSdsExpressionStatement(statement)) {
            const expressionStatement = this.generateExpression(statement.expression, frame);
            result.push(...frame.getExtraStatements(), expressionStatement);
        } else if (isSdsOutputStatement(statement)) {
            if (frame.disableRunnerIntegration || !frame.targetStatements?.includes(statement.$containerIndex ?? -1)) {
                const expressionStatement = this.generateExpression(statement.expression, frame);
                result.push(...frame.getExtraStatements(), expressionStatement);
            } else {
                const outputStatement = this.generateOutputStatement(statement, frame);
                result.push(...frame.getExtraStatements(), outputStatement);
            }
        } /* c8 ignore start */ else {
            throw new Error(`Unknown statement: ${statement}`);
        } /* c8 ignore stop */

        frame.resetExtraStatements();
        return joinTracedToNode(statement)(result, {
            separator: NL,
        });
    }

    private generateAssignment(
        assignment: SdsAssignment,
        frame: GenerationInfoFrame,
        generateLambda: boolean,
    ): Generated {
        const rhsType = this.typeComputer.computeType(assignment.expression);
        const requiredAssignees = rhsType instanceof NamedTupleType ? rhsType.length : 1;

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
                        )`${RUNNER_PACKAGE}.save_placeholder('${savableAssignment.name}', ${PLACEHOLDER_PREFIX}${savableAssignment.name})`,
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

    private generateOutputStatement(node: SdsOutputStatement, frame: GenerationInfoFrame): Generated {
        let valueNames: string[] = [];
        if (isSdsCall(node.expression)) {
            const callable = this.nodeMapper.callToCallable(node.expression);
            if (isSdsClass(callable)) {
                valueNames = ['instance'];
            } else {
                valueNames = getAbstractResults(callable).map((it) => it.name);
            }
        } else if (isSdsMemberAccess(node.expression)) {
            const declarationName = node.expression.member?.target?.ref?.name;
            if (declarationName) {
                valueNames = [declarationName];
            }
        } else {
            valueNames = ['expression'];
        }

        const assignmentStatements: Generated[] = [];

        assignmentStatements.push(
            expandTracedToNode(node)`${joinToNode(
                valueNames,
                (valueName) => `${OUTPUT_PREFIX}${node.$containerIndex}_${valueName}`,
                {
                    separator: ', ',
                },
            )} = ${this.generateExpression(node.expression!, frame)}`,
        );

        for (const valueName of valueNames) {
            frame.addImport({ importPath: RUNNER_PACKAGE });

            assignmentStatements.push(
                expandToNode`${RUNNER_PACKAGE}.save_placeholder('${CODEGEN_PREFIX}${node.$containerIndex}_${valueName}', ${OUTPUT_PREFIX}${node.$containerIndex}_${valueName})`,
            );
        }

        return joinTracedToNode(node)(assignmentStatements, (stmt) => stmt, {
            separator: NL,
        })!;
    }

    private generateAssignee(assignee: SdsAssignee): Generated {
        if (isSdsBlockLambdaResult(assignee)) {
            return expandTracedToNode(assignee)`${BLOCK_LAMBDA_RESULT_PREFIX}${traceToNode(
                assignee,
                'name',
            )(assignee.name)}`;
        } else if (isSdsPlaceholder(assignee)) {
            return expandTracedToNode(assignee)`${PLACEHOLDER_PREFIX}${assignee.name}`;
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

    private generateBlockLambda(blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): Generated {
        const results = streamBlockLambdaResults(blockLambda).toArray();
        const lambdaFrame = frame.newScope();
        const lambdaBlock = this.generateBlock(blockLambda.body, lambdaFrame, true);
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

        const extraStatement = expandTracedToNode(blockLambda)`def ${frame.getUniqueLambdaName(
            blockLambda,
        )}(${this.generateParameters(blockLambda.parameterList, frame)}):`
            .appendNewLine()
            .indent({
                indentedChildren: [lambdaBlock],
                indentation: PYTHON_INDENT,
            });
        frame.addExtraStatement(blockLambda, extraStatement);

        return traceToNode(blockLambda)(frame.getUniqueLambdaName(blockLambda));
    }

    private generateExpressionLambda(node: SdsExpressionLambda, frame: GenerationInfoFrame): Generated {
        const name = frame.getUniqueLambdaName(node);
        const parameters = this.generateParameters(node.parameterList, frame);
        const lambdaFrame = frame.newScope();
        const result = this.generateExpression(node.result, lambdaFrame);

        const extraStatement = expandTracedToNode(node)`
            def ${name}(${parameters}):
                ${joinToNode(lambdaFrame.getExtraStatements(), { separator: NL })}
                return ${result}
        `;
        frame.addExtraStatement(node, extraStatement);

        return traceToNode(node)(name);
    }

    private generateExpression(
        expression: SdsExpression,
        frame: GenerationInfoFrame,
        thisParam?: Generated,
    ): Generated {
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
            return this.generateBlockLambda(expression, frame);
        } else if (isSdsCall(expression)) {
            const callable = this.nodeMapper.callToCallable(expression);
            const receiver = this.generateExpression(expression.receiver, frame);
            let call: Generated | undefined = undefined;

            // Memoize constructor or function call
            if (isSdsFunction(callable) || isSdsClass(callable)) {
                if (isSdsFunction(callable)) {
                    const pythonCall = this.builtinAnnotations.getPythonMacro(callable);
                    if (pythonCall) {
                        let newReceiver: SdsExpression | undefined = undefined;
                        if (isSdsMemberAccess(expression.receiver)) {
                            newReceiver = expression.receiver.receiver;
                        }
                        call = this.generatePythonMacro(expression, pythonCall, frame, newReceiver);
                    }
                }
                if (!call && this.isMemoizableCall(expression) && !frame.disableRunnerIntegration) {
                    let newReceiver: SdsExpression | undefined = undefined;
                    if (isSdsMemberAccess(expression.receiver)) {
                        newReceiver = expression.receiver.receiver;
                    }
                    call = this.generateMemoizedCall(expression, frame, newReceiver);
                }
            }

            if (!call) {
                call = this.generatePlainCall(expression, frame);
            }

            if (expression.isNullSafe) {
                frame.addUtility(nullSafeCall);
                return expandTracedToNode(expression)`${traceToNode(
                    expression,
                    'isNullSafe',
                )(nullSafeCall.name)}(${receiver}, lambda: ${call})`;
            } else {
                return call;
            }
        } else if (isSdsExpressionLambda(expression)) {
            return this.generateExpressionLambda(expression, frame);
        } else if (isSdsInfixOperation(expression)) {
            const leftOperand = this.generateExpression(expression.leftOperand, frame);
            const rightOperand = this.generateExpression(expression.rightOperand, frame);

            const leftOperandType = this.typeComputer.computeType(expression.leftOperand);
            const rightOperandType = this.typeComputer.computeType(expression.rightOperand);

            switch (expression.operator) {
                case 'or':
                    if (
                        this.typeChecker.isSubtypeOf(leftOperandType, this.coreTypes.Boolean) &&
                        this.typeChecker.isSubtypeOf(rightOperandType, this.coreTypes.Boolean)
                    ) {
                        frame.addUtility(eagerOr);
                        return expandTracedToNode(expression)`${traceToNode(
                            expression,
                            'operator',
                        )(eagerOr.name)}(${leftOperand}, ${rightOperand})`;
                    } else {
                        return expandTracedToNode(expression)`(${leftOperand}) ${traceToNode(
                            expression,
                            'operator',
                        )('|')} (${rightOperand})`;
                    }
                case 'and':
                    if (
                        this.typeChecker.isSubtypeOf(leftOperandType, this.coreTypes.Boolean) &&
                        this.typeChecker.isSubtypeOf(rightOperandType, this.coreTypes.Boolean)
                    ) {
                        frame.addUtility(eagerAnd);
                        return expandTracedToNode(expression)`${traceToNode(
                            expression,
                            'operator',
                        )(eagerAnd.name)}(${leftOperand}, ${rightOperand})`;
                    } else {
                        return expandTracedToNode(expression)`(${leftOperand}) ${traceToNode(
                            expression,
                            'operator',
                        )('&')} (${rightOperand})`;
                    }
                case '?:':
                    frame.addUtility(eagerElvis);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'operator',
                    )(eagerElvis.name)}(${leftOperand}, ${rightOperand})`;
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
                frame.addUtility(nullSafeIndexedAccess);
                return expandTracedToNode(expression)`${traceToNode(
                    expression,
                    'isNullSafe',
                )(nullSafeIndexedAccess.name)}(${this.generateExpression(
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
                const resultList = getAbstractResults(AstUtils.getContainerOfType(member, isSdsCallable));
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
                    frame.addUtility(nullSafeMemberAccess);
                    return expandTracedToNode(expression)`${traceToNode(
                        expression,
                        'isNullSafe',
                    )(nullSafeMemberAccess.name)}(${receiver}, '${memberExpression}')`;
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
                    const operandType = this.typeComputer.computeType(expression.operand);
                    if (this.typeChecker.isSubtypeOf(operandType, this.coreTypes.Boolean)) {
                        return expandTracedToNode(
                            expression,
                        )`${traceToNode(expression, 'operator')('not')} (${operand})`;
                    } else {
                        return expandTracedToNode(expression)`${traceToNode(expression, 'operator')('~')}(${operand})`;
                    }
                case '-':
                    return expandTracedToNode(expression)`${traceToNode(expression, 'operator')('-')}(${operand})`;
            }
        } else if (isSdsReference(expression)) {
            const declaration = expression.target.ref!;
            const referenceImport = this.createImportDataForReference(expression);
            frame.addImport(referenceImport);

            if (isSdsPlaceholder(declaration)) {
                return traceToNode(expression)(`${PLACEHOLDER_PREFIX}${declaration.name}`);
            } else {
                return traceToNode(expression)(referenceImport?.alias ?? this.getPythonNameOrDefault(declaration));
            }
        } else if (isSdsThis(expression)) {
            return thisParam;
        } else if (isSdsTypeCast(expression)) {
            return traceToNode(expression)(this.generateExpression(expression.expression, frame));
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown expression type: ${expression.$type}`);
    }

    private generatePlainCall(expression: SdsCall, frame: GenerationInfoFrame): Generated {
        const sortedArgs = this.sortArguments(getArguments(expression));

        return expandTracedToNode(expression)`${this.generateExpression(expression.receiver, frame)}(${joinTracedToNode(
            expression.argumentList,
            'arguments',
        )(sortedArgs, (arg) => this.generateArgument(arg, frame), { separator: ', ' })})`;
    }

    private generatePythonMacro(
        expression: SdsCall,
        pythonCall: string,
        frame: GenerationInfoFrame,
        receiver: SdsExpression | undefined,
    ): Generated {
        const argumentsMap = this.getArgumentsMap(getArguments(expression), frame);
        let thisParam: Generated | undefined = undefined;

        if (receiver) {
            thisParam = frame.getUniqueReceiverName(receiver);
            const extraStatement = expandTracedToNode(receiver)`
                ${thisParam} = ${this.generateExpression(receiver, frame)}
            `;
            frame.addExtraStatement(receiver, extraStatement);

            argumentsMap.set('this', thisParam);
        }
        const splitRegex = /(\$[_a-zA-Z][_a-zA-Z0-9]*)/gu;
        const splitPythonMacroDefinition = pythonCall.split(splitRegex);
        return expandToNode`(${joinTracedToNode(expression)(
            splitPythonMacroDefinition,
            (part) => {
                if (splitRegex.test(part)) {
                    return expandToNode`(${argumentsMap.get(part.substring(1))!})`;
                } else {
                    return part;
                }
            },
            { separator: '' },
        )!})`;
    }

    private isMemoizableCall(expression: SdsCall): boolean {
        const impurityReasons = this.purityComputer.getImpurityReasonsForExpression(expression);
        // If the file is not known, the call is not memoizable
        return (
            !impurityReasons.some((reason) => !(reason instanceof FileRead) || reason.path === undefined) &&
            !this.doesCallContainLambdaReferencingSegment(expression)
        );
    }

    private doesCallContainLambdaReferencingSegment(expression: SdsCall): boolean {
        return getArguments(expression).some((arg) => {
            if (isSdsExpressionLambda(arg.value)) {
                return this.containsSegmentCall(arg.value.result);
            } else if (isSdsBlockLambda(arg.value)) {
                return this.containsSegmentCall(arg.value.body);
            } else {
                /* c8 ignore next 2 */
                return false;
            }
        });
    }

    private containsSegmentCall(node: AstNode | undefined): boolean {
        if (!node) {
            /* c8 ignore next 2 */
            return false;
        }
        return AstUtils.streamAst(node)
            .filter(isSdsAbstractCall)
            .some((call) => {
                const callable = this.nodeMapper.callToCallable(call);
                return isSdsSegment(callable);
            });
    }

    private generateMemoizedCall(
        expression: SdsCall,
        frame: GenerationInfoFrame,
        receiver: SdsExpression | undefined,
    ): Generated {
        const callable = this.nodeMapper.callToCallable(expression);

        if (isSdsFunction(callable) && !isStatic(callable) && isSdsExpression(receiver)) {
            return this.generateMemoizedDynamicCall(expression, callable, receiver, frame);
        } else {
            return this.generateMemoizedStaticCall(expression, callable, frame);
        }
    }

    private generateMemoizedDynamicCall(
        expression: SdsCall,
        callable: SdsFunction,
        receiver: SdsExpression,
        frame: GenerationInfoFrame,
    ) {
        frame.addImport({ importPath: RUNNER_PACKAGE });

        const hiddenParameters = this.getMemoizedCallHiddenParameters(expression, frame);
        const thisParam = frame.getUniqueReceiverName(receiver);
        const extraStatement = expandTracedToNode(receiver)`
            ${thisParam} = ${this.generateExpression(receiver, frame)}
        `;
        frame.addExtraStatement(receiver, extraStatement);

        return expandTracedToNode(expression)`
            ${MEMOIZED_DYNAMIC_CALL}(
                ${thisParam},
                "${this.getPythonNameOrDefault(callable)}",
                [${this.generateMemoizedPositionalArgumentList(expression, frame)}],
                {${this.generateMemoizedKeywordArgumentList(expression, frame, thisParam)}},
                [${joinToNode(hiddenParameters, (param) => param, { separator: ', ' })}]
            )
        `;
    }

    private generateMemoizedStaticCall(
        expression: SdsCall,
        callable: SdsCallable | undefined,
        frame: GenerationInfoFrame,
    ) {
        frame.addImport({ importPath: RUNNER_PACKAGE });
        if (isSdsMemberAccess(expression.receiver)) {
            const classDeclaration = getOutermostContainerOfType(callable, isSdsClass)!;
            const referenceImport = this.createImportDataForNode(classDeclaration, expression.receiver.member!);
            frame.addImport(referenceImport);
        }

        const fullyQualifiedTargetName = this.generateFullyQualifiedFunctionName(expression);
        const hiddenParameters = this.getMemoizedCallHiddenParameters(expression, frame);

        return expandTracedToNode(expression)`
            ${MEMOIZED_STATIC_CALL}(
                "${fullyQualifiedTargetName}",
                ${
                    isSdsMemberAccess(expression.receiver)
                        ? this.getClassQualifiedNameForMember(<SdsClassMember>callable)
                        : this.generateExpression(expression.receiver, frame)
                },
                [${this.generateMemoizedPositionalArgumentList(expression, frame)}],
                {${this.generateMemoizedKeywordArgumentList(expression, frame)}},
                [${joinToNode(hiddenParameters, (param) => param, { separator: ', ' })}]
            )
        `;
    }

    private generateMemoizedPositionalArgumentList(node: SdsCall, frame: GenerationInfoFrame): Generated {
        const callable = this.nodeMapper.callToCallable(node);
        const parameters = getParameters(callable);
        const requiredParameters = getParameters(callable).filter(Parameter.isRequired);
        const parametersToArgument = this.nodeMapper.parametersToArguments(parameters, getArguments(node));

        return joinTracedToNode(node.argumentList, 'arguments')(
            requiredParameters,
            (parameter) => {
                const argument = parametersToArgument.get(parameter);
                return this.generateMemoizedArgument(argument, parameter, frame);
            },
            {
                separator: ', ',
            },
        );
    }

    private generateMemoizedKeywordArgumentList(
        node: SdsCall,
        frame: GenerationInfoFrame,
        thisParam?: Generated,
    ): Generated {
        const callable = this.nodeMapper.callToCallable(node);
        const parameters = getParameters(callable);
        const optionalParameters = getParameters(callable).filter(Parameter.isOptional);
        const parametersToArgument = this.nodeMapper.parametersToArguments(parameters, getArguments(node));

        return joinTracedToNode(node.argumentList, 'arguments')(
            optionalParameters,
            (parameter) => {
                const argument = parametersToArgument.get(parameter);
                return expandToNode`"${this.getPythonNameOrDefault(parameter)}": ${this.generateMemoizedArgument(argument, parameter, frame, thisParam)}`;
            },
            {
                separator: ', ',
            },
        );
    }

    private generateMemoizedArgument(
        argument: SdsArgument | undefined,
        parameter: SdsParameter,
        frame: GenerationInfoFrame,
        thisParam?: Generated | undefined,
    ): Generated {
        const value = argument?.value ?? parameter?.defaultValue;
        if (!value) {
            /* c8 ignore next 2 */
            throw new Error(`No value passed for required parameter "${parameter.name}".`);
        }

        const result = this.generateExpression(value, frame, thisParam);
        if (!this.isMemoizedPath(parameter)) {
            return result;
        }

        frame.addImport({ importPath: RUNNER_PACKAGE });
        return expandToNode`${RUNNER_PACKAGE}.absolute_path(${result})`;
    }

    private isMemoizedPath(parameter: SdsParameter): boolean {
        const callable = AstUtils.getContainerOfType(parameter, isSdsCallable);
        const impurityReasons = this.purityComputer.getImpurityReasonsForCallable(callable);
        return impurityReasons.some((reason) => reason instanceof FileRead && reason.path === parameter);
    }

    private getMemoizedCallHiddenParameters(expression: SdsCall, frame: GenerationInfoFrame): Generated[] {
        const impurityReasons = this.purityComputer.getImpurityReasonsForCallable(
            this.nodeMapper.callToCallable(expression),
        );
        const hiddenParameters: Generated[] = [];
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

    private getClassQualifiedNameForMember(node: SdsClassMember): string {
        const classMemberPath = [];
        let enclosingClass: SdsDeclaration | undefined = node;
        while (enclosingClass) {
            classMemberPath.unshift(this.getPythonNameOrDefault(enclosingClass));
            enclosingClass = AstUtils.getContainerOfType(enclosingClass.$container, isSdsClass);
        }
        return classMemberPath.join('.');
    }

    private getArgumentsMap(argumentList: SdsArgument[], frame: GenerationInfoFrame): Map<string, Generated> {
        const argumentsMap = new Map<string, Generated>();
        argumentList.reduce((map, value) => {
            map.set(this.nodeMapper.argumentToParameter(value)?.name!, this.generateArgument(value, frame, false));
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
    ): Generated {
        const parameter = this.nodeMapper.argumentToParameter(argument);
        return expandTracedToNode(argument)`${
            parameter !== undefined && !Parameter.isRequired(parameter) && generateOptionalParameterName
                ? expandToNode`${this.generateParameter(parameter, frame, false)}=`
                : ''
        }${this.generateExpression(argument.value, frame)}`;
    }

    private createImportDataForNode(
        declaration: SdsDeclaration,
        context: AstNode,
        refText: string = declaration.name,
    ): ImportData | undefined {
        const sourceModule = <SdsModule>AstUtils.findRootNode(context);
        const targetModule = <SdsModule>AstUtils.findRootNode(declaration);

        // Compute import path
        let importPath: string | undefined = undefined;
        if (isSdsPipeline(declaration) || isSdsSegment(declaration)) {
            if (sourceModule !== targetModule) {
                importPath = `${this.getPythonModuleOrDefault(targetModule)}.${this.formatGeneratedFileName(
                    this.getModuleFileBaseName(targetModule),
                )}`;
            }
        } else if (isSdsModule(declaration.$container)) {
            importPath = this.getPythonModuleOrDefault(targetModule);
        }

        if (importPath) {
            return {
                importPath,
                declarationName: this.getPythonNameOrDefault(declaration),
                alias: refText === declaration.name ? undefined : refText,
            };
        } else {
            return undefined;
        }
    }

    private createImportDataForReference(reference: SdsReference): ImportData | undefined {
        const target = reference.target.ref;
        if (!target) {
            /* c8 ignore next 2 */
            return undefined;
        }
        return this.createImportDataForNode(target, reference, reference.target.$refText);
    }

    private getModuleFileBaseName(module: SdsModule): string {
        const filePath = AstUtils.getDocument(module).uri.fsPath;
        return path.basename(filePath, path.extname(filePath));
    }

    private formatStringSingleLine(value: string): string {
        return value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n');
    }
}

interface ImportData {
    readonly importPath: string;
    readonly declarationName?: string;
    readonly alias?: string;
}

class GenerationInfoFrame {
    private readonly idManager: IdManager<SdsExpression>;
    private readonly importSet: Map<String, ImportData>;
    private readonly utilitySet: Set<UtilityFunction>;
    private readonly typeVariableSet: Set<string>;
    public readonly isInsidePipeline: boolean;
    public readonly targetStatements: number[] | undefined;
    public readonly disableRunnerIntegration: boolean;
    private extraStatements = new Map<SdsExpression, Generated>();

    constructor(
        importSet: Map<String, ImportData> = new Map<String, ImportData>(),
        utilitySet: Set<UtilityFunction> = new Set<UtilityFunction>(),
        typeVariableSet: Set<string> = new Set<string>(),
        insidePipeline: boolean = false,
        targetStatements: number[] | undefined = undefined,
        disableRunnerIntegration: boolean = false,
        idManager: IdManager<SdsExpression> = new IdManager(),
    ) {
        this.idManager = idManager;
        this.importSet = importSet;
        this.utilitySet = utilitySet;
        this.typeVariableSet = typeVariableSet;
        this.isInsidePipeline = insidePipeline;
        this.targetStatements = targetStatements;
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

    addExtraStatement(node: SdsExpression, statement: Generated): void {
        if (!this.extraStatements.has(node)) {
            this.extraStatements.set(node, statement);
        }
    }

    resetExtraStatements(): void {
        this.extraStatements.clear();
    }

    getExtraStatements(): Generated[] {
        return Array.from(this.extraStatements.values());
    }

    getUniqueLambdaName(lambda: SdsLambda): string {
        return `${LAMBDA_PREFIX}${this.idManager.assignId(lambda)}`;
    }

    getUniqueReceiverName(receiver: SdsExpression): string {
        return `${RECEIVER_PREFIX}${this.idManager.assignId(receiver)}`;
    }

    newScope(): GenerationInfoFrame {
        return new GenerationInfoFrame(
            this.importSet,
            this.utilitySet,
            this.typeVariableSet,
            this.isInsidePipeline,
            this.targetStatements,
            this.disableRunnerIntegration,
            this.idManager,
        );
    }
}

export interface GenerateOptions {
    /**
     * Where the generated code should be written to.
     */
    destination: URI;

    /**
     * Whether to create source maps for the generated code.
     */
    createSourceMaps: boolean;

    /**
     * The indices of the statements to generate code for. Code will also be generated for any statements that affect
     * the target statements.
     *
     * If undefined, only code for statements with side effects and those that affect them will be generated.
     */
    targetStatements: number[] | number | undefined;

    /**
     * Whether to disable the integration with the `safe-ds-runner` package and instead generate plain Python code.
     */
    disableRunnerIntegration: boolean;
}
