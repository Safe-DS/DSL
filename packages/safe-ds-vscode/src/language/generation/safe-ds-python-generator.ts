import { SafeDsServices } from '../safe-ds-module.js';
import {
    isSdsAbstractResult,
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCall,
    isSdsCallable,
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
    SdsDeclaration,
    SdsExpression,
    SdsModule,
    SdsParameter,
    SdsParameterList,
    SdsPipeline,
    SdsSegment,
    SdsStatement,
} from '../generated/ast.js';
import { isInStubFile, isStubFile } from '../helpers/fileExtensions.js';
import path from 'path';
import {
    expandToString,
    expandToStringWithNL,
    findRootNode,
    getContainerOfType,
    getDocument,
    LangiumDocument,
    streamAllContents,
    URI,
} from 'langium';
import {
    getAbstractResults,
    getAssignees,
    getImportedDeclarations,
    getImports,
    getModuleMembers,
    getStatements,
    isRequiredParameter,
    streamBlockLambdaResults,
} from '../helpers/nodeProperties.js';
import { groupBy } from '../../helpers/collectionUtils.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../partialEvaluation/model.js';
import { IdManager } from '../helpers/idManager.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { SafeDsPartialEvaluator } from '../partialEvaluation/safe-ds-partial-evaluator.js';

export const CODEGEN_PREFIX = '__gen_';
const BLOCK_LAMBDA_PREFIX = `${CODEGEN_PREFIX}block_lambda_`;
const BLOCK_LAMBDA_RESULT_PREFIX = `${CODEGEN_PREFIX}block_lambda_result_`;
const YIELD_PREFIX = `${CODEGEN_PREFIX}yield_`;

const RUNNER_CODEGEN_PACKAGE = 'safeds_runner.codegen';
const PYTHON_INDENT = '    ';

export class SafeDsPythonGenerator {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;

    constructor(services: SafeDsServices) {
        this.builtinAnnotations = services.builtins.Annotations;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
    }

    generate(document: LangiumDocument, destination: URI): TextDocument[] {
        const node = document.parseResult.value;

        // Do not generate stub files
        if (isStubFile(document) || !isSdsModule(node)) {
            return [];
        }

        const name = path.parse(document.uri.fsPath).name;
        const pythonModuleName = this.builtinAnnotations.getPythonModule(node);
        const packagePath = pythonModuleName === undefined ? node.name.split('.') : [pythonModuleName];
        const parentDirectoryPath = path.join(destination.fsPath, ...packagePath);

        const generatedFiles = new Map<string, string>();
        generatedFiles.set(
            `${path.join(parentDirectoryPath, this.formatGeneratedFileName(name))}.py`,
            this.generateModule(node),
        );
        for (const pipeline of streamAllContents(node).filter(isSdsPipeline)) {
            const entryPointFilename = `${path.join(
                parentDirectoryPath,
                `${this.formatGeneratedFileName(name)}_${this.getPythonNameOrDefault(pipeline)}`,
            )}.py`;
            const entryPointContent = expandToStringWithNL`from ${this.formatGeneratedFileName(
                name,
            )} import ${this.getPythonNameOrDefault(
                pipeline,
            )}\n\nif __name__ == '__main__':\n${PYTHON_INDENT}${this.getPythonNameOrDefault(pipeline)}()`;
            generatedFiles.set(entryPointFilename, entryPointContent);
        }

        return Array.from(generatedFiles.entries()).map(([fsPath, content]) =>
            TextDocument.create(URI.file(fsPath).toString(), 'py', 0, content),
        );
    }

    private getPythonNameOrDefault(object: SdsDeclaration) {
        return this.builtinAnnotations.getPythonName(object) || object.name;
    }

    private formatGeneratedFileName(baseName: string): string {
        return `gen_${baseName.replaceAll('%2520', '_').replaceAll(/[ .-]/gu, '_').replaceAll(/\\W/gu, '')}`;
    }

    private generateModule(module: SdsModule): string {
        const importSet = new Map<String, ImportData>();
        const segments = getModuleMembers(module)
            .filter(isSdsSegment)
            .map((segment) => this.generateSegment(segment, importSet));
        const pipelines = getModuleMembers(module)
            .filter(isSdsPipeline)
            .map((pipeline) => this.generatePipeline(pipeline, importSet));
        const imports = this.generateImports(Array.from(importSet.values()));
        const output: string[] = [];
        if (imports.length > 0) {
            output.push(
                expandToStringWithNL`# Imports ----------------------------------------------------------------------\n\n${imports.join(
                    '\n',
                )}`,
            );
        }
        if (segments.length > 0) {
            output.push(
                expandToStringWithNL`# Segments ---------------------------------------------------------------------\n\n${segments.join(
                    '\n\n',
                )}`,
            );
        }
        if (pipelines.length > 0) {
            output.push(
                expandToStringWithNL`# Pipelines --------------------------------------------------------------------\n\n${pipelines.join(
                    '\n\n',
                )}`,
            );
        }
        return expandToStringWithNL`${output.join('\n')}`;
    }

    private generateSegment(segment: SdsSegment, importSet: Map<String, ImportData>): string {
        const infoFrame = new GenerationInfoFrame(importSet);
        const segmentResult = segment.resultList?.results || [];
        let segmentBlock = this.generateBlock(segment.body, infoFrame);
        if (segmentResult.length !== 0) {
            segmentBlock += `\nreturn ${segmentResult.map((result) => `${YIELD_PREFIX}${result.name}`).join(', ')}`;
        }
        return expandToString`def ${this.getPythonNameOrDefault(segment)}(${this.generateParameters(
            segment.parameterList,
            infoFrame,
        )}):\n${PYTHON_INDENT}${segmentBlock}`;
    }

    private generateParameters(parameters: SdsParameterList | undefined, frame: GenerationInfoFrame): string {
        const result = (parameters?.parameters || []).map((param) => this.generateParameter(param, frame));
        return result.join(', ');
    }

    private generateParameter(
        parameter: SdsParameter,
        frame: GenerationInfoFrame,
        defaultValue: boolean = true,
    ): string {
        return expandToString`${this.getPythonNameOrDefault(parameter)}${
            defaultValue && parameter.defaultValue !== undefined
                ? '=' + this.generateExpression(parameter.defaultValue, frame)
                : ''
        }`;
    }

    private generatePipeline(pipeline: SdsPipeline, importSet: Map<String, ImportData>): string {
        const infoFrame = new GenerationInfoFrame(importSet);
        return expandToString`def ${this.getPythonNameOrDefault(pipeline)}():\n${PYTHON_INDENT}${this.generateBlock(
            pipeline.body,
            infoFrame,
        )}`;
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

    private generateBlock(block: SdsBlock, frame: GenerationInfoFrame): string {
        // TODO filter withEffect
        let statements = getStatements(block);
        if (statements.length === 0) {
            return 'pass';
        }
        return expandToString`${statements.map((stmt) => this.generateStatement(stmt, frame)).join('\n')}`;
    }

    private generateStatement(statement: SdsStatement, frame: GenerationInfoFrame): string {
        if (isSdsAssignment(statement)) {
            return this.generateAssignment(statement, frame);
        } else if (isSdsExpressionStatement(statement)) {
            const expressionStatement = statement;
            const blockLambdaCode: string[] = [];
            for (const lambda of streamAllContents(expressionStatement.expression).filter(isSdsBlockLambda)) {
                blockLambdaCode.push(this.generateBlockLambda(lambda, frame));
            }
            blockLambdaCode.push(this.generateExpression(expressionStatement.expression, frame));
            return expandToString`${blockLambdaCode.join('\n')}`;
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown SdsStatement: ${statement}`);
    }

    private generateAssignment(assignment: SdsAssignment, frame: GenerationInfoFrame): string {
        const requiredAssignees = isSdsCall(assignment.expression)
            ? getAbstractResults(this.nodeMapper.callToCallable(assignment.expression)).length
            : /* c8 ignore next */
              1;
        const assignees = getAssignees(assignment);
        if (assignees.some((value) => !isSdsWildcard(value))) {
            const actualAssignees = assignees.map(this.generateAssignee);
            if (requiredAssignees === actualAssignees.length) {
                return `${actualAssignees.join(', ')} = ${this.generateExpression(assignment.expression!, frame)}`;
            } else {
                // Add wildcards to match given results
                return `${actualAssignees
                    .concat(Array(requiredAssignees - actualAssignees.length).fill('_'))
                    .join(', ')} = ${this.generateExpression(assignment.expression!, frame)}`;
            }
        } else {
            return this.generateExpression(assignment.expression!, frame);
        }
    }

    private generateAssignee(assignee: SdsAssignee): string {
        if (isSdsBlockLambdaResult(assignee)) {
            return `${BLOCK_LAMBDA_RESULT_PREFIX}${assignee.name}`;
        } else if (isSdsPlaceholder(assignee)) {
            return assignee.name;
        } else if (isSdsWildcard(assignee)) {
            return '_';
        } else if (isSdsYield(assignee)) {
            return `${YIELD_PREFIX}${assignee.result?.ref?.name!}`;
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown SdsAssignment: ${assignee.$type}`);
    }

    private generateBlockLambda(blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): string {
        const results = streamBlockLambdaResults(blockLambda);
        let lambdaBlock = this.generateBlock(blockLambda.body, frame);
        if (!results.isEmpty()) {
            lambdaBlock += `\nreturn ${results
                .map((result) => `${BLOCK_LAMBDA_RESULT_PREFIX}${result.name}`)
                .join(', ')}`;
        }
        return expandToString`def ${frame.getUniqueLambdaBlockName(blockLambda)}(${this.generateParameters(
            blockLambda.parameterList,
            frame,
        )}):\n${PYTHON_INDENT}${lambdaBlock}`;
    }

    private generateExpression(expression: SdsExpression, frame: GenerationInfoFrame): string {
        if (isSdsTemplateStringPart(expression)) {
            if (isSdsTemplateStringStart(expression)) {
                return `${this.formatStringSingleLine(expression.value)}{ `;
            } else if (isSdsTemplateStringInner(expression)) {
                return ` }${this.formatStringSingleLine(expression.value)}{ `;
            } else if (isSdsTemplateStringEnd(expression)) {
                return ` }${this.formatStringSingleLine(expression.value)}`;
            }
        }

        const partiallyEvaluatedNode = this.partialEvaluator.evaluate(expression);
        if (partiallyEvaluatedNode instanceof BooleanConstant) {
            return partiallyEvaluatedNode.value ? 'True' : 'False';
        } else if (partiallyEvaluatedNode instanceof IntConstant) {
            return String(partiallyEvaluatedNode.value);
        } else if (partiallyEvaluatedNode instanceof FloatConstant) {
            const floatValue = partiallyEvaluatedNode.value;
            return Number.isInteger(floatValue) ? `${floatValue}.0` : String(floatValue);
        } else if (partiallyEvaluatedNode === NullConstant) {
            return 'None';
        } else if (partiallyEvaluatedNode instanceof StringConstant) {
            return `'${this.formatStringSingleLine(partiallyEvaluatedNode.value)}'`;
        }

        // Handled after constant expressions: EnumVariant, List, Map
        else if (isSdsTemplateString(expression)) {
            return `f'${expression.expressions.map((expr) => this.generateExpression(expr, frame)).join('')}'`;
        } else if (isSdsMap(expression)) {
            const mapContent = expression.entries.map(
                (entry) =>
                    `${this.generateExpression(entry.key, frame)}: ${this.generateExpression(entry.value, frame)}`,
            );
            return `{${mapContent.join(', ')}}`;
        } else if (isSdsList(expression)) {
            const listContent = expression.elements.map((value) => this.generateExpression(value, frame));
            return `[${listContent.join(', ')}]`;
        } else if (isSdsBlockLambda(expression)) {
            return frame.getUniqueLambdaBlockName(expression);
        } else if (isSdsCall(expression)) {
            const callable = this.nodeMapper.callToCallable(expression);
            if (isSdsFunction(callable)) {
                const pythonCall = this.builtinAnnotations.getPythonCall(callable);
                if (pythonCall) {
                    let thisParam: string | undefined = undefined;
                    if (isSdsMemberAccess(expression.receiver)) {
                        thisParam = this.generateExpression(expression.receiver.receiver, frame);
                    }
                    const argumentsMap = this.getArgumentsMap(expression.argumentList.arguments, frame);
                    return this.generatePythonCall(pythonCall, argumentsMap, thisParam);
                }
            }

            const sortedArgs = this.sortArguments(expression.argumentList.arguments);
            return expandToString`${this.generateExpression(expression.receiver, frame)}(${sortedArgs
                .map((arg) => this.generateArgument(arg, frame))
                .join(', ')})`;
        } else if (isSdsExpressionLambda(expression)) {
            return `lambda ${this.generateParameters(expression.parameterList, frame)}: ${this.generateExpression(
                expression.result,
                frame,
            )}`;
        } else if (isSdsInfixOperation(expression)) {
            const leftOperand = this.generateExpression(expression.leftOperand, frame);
            const rightOperand = this.generateExpression(expression.rightOperand, frame);
            switch (expression.operator) {
                case 'or':
                    frame.addImport({ importPath: RUNNER_CODEGEN_PACKAGE });
                    return `${RUNNER_CODEGEN_PACKAGE}.eager_or(${leftOperand}, ${rightOperand})`;
                case 'and':
                    frame.addImport({ importPath: RUNNER_CODEGEN_PACKAGE });
                    return `${RUNNER_CODEGEN_PACKAGE}.eager_and(${leftOperand}, ${rightOperand})`;
                case '?:':
                    frame.addImport({ importPath: RUNNER_CODEGEN_PACKAGE });
                    return `${RUNNER_CODEGEN_PACKAGE}.eager_elvis(${leftOperand}, ${rightOperand})`;
                case '===':
                    return `(${leftOperand}) is (${rightOperand})`;
                case '!==':
                    return `(${leftOperand}) is not (${rightOperand})`;
                default:
                    return `(${leftOperand}) ${expression.operator} (${rightOperand})`;
            }
        } else if (isSdsIndexedAccess(expression)) {
            return expandToString`${this.generateExpression(expression.receiver, frame)}[${this.generateExpression(
                expression.index,
                frame,
            )}]`;
        } else if (isSdsMemberAccess(expression)) {
            const member = expression.member?.target.ref!;
            const receiver = this.generateExpression(expression.receiver, frame);
            if (isSdsEnumVariant(member)) {
                const enumMember = this.generateExpression(expression.member!, frame);
                const suffix = isSdsCall(expression.$container) ? '' : '()';
                return `${receiver}.${enumMember}${suffix}`;
            } else if (isSdsAbstractResult(member)) {
                const resultList = getAbstractResults(getContainerOfType(member, isSdsCallable));
                if (resultList.length === 1) {
                    return receiver;
                }
                const currentIndex = resultList.indexOf(member);
                return `${receiver}[${currentIndex}]`;
            } else {
                const memberExpression = this.generateExpression(expression.member!, frame);
                if (expression.isNullSafe) {
                    frame.addImport({ importPath: RUNNER_CODEGEN_PACKAGE });
                    return `${RUNNER_CODEGEN_PACKAGE}.safe_access(${receiver}, '${memberExpression}')`;
                } else {
                    return `${receiver}.${memberExpression}`;
                }
            }
        } else if (isSdsParenthesizedExpression(expression)) {
            return expandToString`${this.generateExpression(expression.expression, frame)}`;
        } else if (isSdsPrefixOperation(expression)) {
            const operand = this.generateExpression(expression.operand, frame);
            switch (expression.operator) {
                case 'not':
                    return expandToString`not (${operand})`;
                case '-':
                    return expandToString`-(${operand})`;
            }
        } else if (isSdsReference(expression)) {
            const declaration = expression.target.ref!;
            const referenceImport =
                this.getExternalReferenceNeededImport(expression, declaration) ||
                this.getInternalReferenceNeededImport(expression, declaration);
            frame.addImport(referenceImport);
            return referenceImport?.alias || this.getPythonNameOrDefault(declaration);
        }
        /* c8 ignore next 2 */
        throw new Error(`Unknown expression type: ${expression.$type}`);
    }

    private generatePythonCall(
        pythonCall: string,
        argumentsMap: Map<string, string>,
        thisParam: string | undefined = undefined,
    ): string {
        if (thisParam) {
            argumentsMap.set('this', thisParam);
        }

        return pythonCall.replace(/\$[_a-zA-Z][_a-zA-Z0-9]*/gu, (value) => argumentsMap.get(value.substring(1))!);
    }

    private getArgumentsMap(argumentList: SdsArgument[], frame: GenerationInfoFrame): Map<string, string> {
        const argumentsMap = new Map<string, string>();
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

    private generateArgument(argument: SdsArgument, frame: GenerationInfoFrame) {
        const parameter = this.nodeMapper.argumentToParameter(argument);
        return expandToString`${
            parameter !== undefined && !isRequiredParameter(parameter)
                ? this.generateParameter(parameter, frame, false) + '='
                : ''
        }${this.generateExpression(argument.value, frame)}`;
    }

    private getExternalReferenceNeededImport(
        expression: SdsExpression,
        declaration: SdsDeclaration,
    ): ImportData | undefined {
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
                                importPath: this.builtinAnnotations.getPythonModule(targetModule) || value.package,
                                declarationName: importedDeclaration.declaration?.ref?.name,
                                alias: importedDeclaration.alias.alias,
                            };
                        } else {
                            return {
                                importPath: this.builtinAnnotations.getPythonModule(targetModule) || value.package,
                                declarationName: importedDeclaration.declaration?.ref?.name,
                            };
                        }
                    }
                }
            }
            if (isSdsWildcardImport(value)) {
                return {
                    importPath: this.builtinAnnotations.getPythonModule(targetModule) || value.package,
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
                importPath: `${
                    this.builtinAnnotations.getPythonModule(targetModule) || targetModule.name
                }.${this.formatGeneratedFileName(this.getModuleFileBaseName(targetModule))}`,
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

interface ImportData {
    readonly importPath: string;
    readonly declarationName?: string;
    readonly alias?: string;
}

class GenerationInfoFrame {
    private readonly blockLambdaManager: IdManager<SdsBlockLambda>;
    private readonly importSet: Map<String, ImportData>;

    constructor(importSet: Map<String, ImportData> = new Map<String, ImportData>()) {
        this.blockLambdaManager = new IdManager<SdsBlockLambda>();
        this.importSet = importSet;
    }

    addImport(importData: ImportData | undefined) {
        if (importData) {
            const hashKey = JSON.stringify(importData);
            if (!this.importSet.has(hashKey)) {
                this.importSet.set(hashKey, importData);
            }
        }
    }

    getUniqueLambdaBlockName(lambda: SdsBlockLambda): string {
        return `${BLOCK_LAMBDA_PREFIX}${this.blockLambdaManager.assignId(lambda)}`;
    }
}
