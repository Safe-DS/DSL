import fs from 'fs';
import {
    expandToString,
    expandToStringWithNL,
    findRootNode,
    getContainerOfType,
    getDocument,
    streamAllContents,
} from 'langium';
import path from 'path';
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
} from '../language/generated/ast.js';
import { extractAstNode, extractDestinationAndName } from './cli-util.js';
import chalk from 'chalk';
import { createSafeDsServices, SafeDsServices } from '../language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import {
    getAbstractResults,
    getAssignees,
    getImportedDeclarations,
    getImports,
    getModuleMembers,
    getStatements,
    isRequiredParameter,
    streamBlockLambdaResults,
} from '../language/helpers/nodeProperties.js';
import { IdManager } from '../language/helpers/idManager.js';
import { isInStubFile } from '../language/helpers/fileExtensions.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../language/partialEvaluation/model.js';
import { groupBy } from '../helpers/collectionUtils.js';

export const CODEGEN_PREFIX = '__gen_';
const BLOCK_LAMBDA_PREFIX = `${CODEGEN_PREFIX}block_lambda_`;
const BLOCK_LAMBDA_RESULT_PREFIX = `${CODEGEN_PREFIX}block_lambda_result_`;
const YIELD_PREFIX = `${CODEGEN_PREFIX}yield_`;

const RUNNER_CODEGEN_PACKAGE = 'safeds_runner.codegen';
const PYTHON_INDENT = '    ';

/* c8 ignore start */
export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
    const module = await extractAstNode<SdsModule>(fileName, services);
    const generatedFilePath = generatePython(services, module, fileName, opts.destination);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Python code generated successfully: ${generatedFilePath}`));
};
/* c8 ignore stop */

export const generatePython = function (
    services: SafeDsServices,
    module: SdsModule,
    filePath: string,
    destination: string | undefined,
): string[] {
    // Do not generate stub files
    if (isInStubFile(module)) {
        return [];
    }
    const data = extractDestinationAndName(filePath, destination);
    const pythonModuleName = services.builtins.Annotations.getPythonModule(module);
    const packagePath = pythonModuleName === undefined ? module.name.split('.') : [pythonModuleName];
    const parentDirectoryPath = path.join(data.destination, ...packagePath);

    const generatedFiles = new Map<string, string>();
    generatedFiles.set(
        `${path.join(parentDirectoryPath, formatGeneratedFileName(data.name))}.py`,
        generateModule(services, module),
    );
    for (const pipeline of streamAllContents(module).filter(isSdsPipeline)) {
        const entryPointFilename = `${path.join(
            parentDirectoryPath,
            `${formatGeneratedFileName(data.name)}_${getPythonNameOrDefault(services, pipeline)}`,
        )}.py`;
        const entryPointContent = expandToStringWithNL`from ${formatGeneratedFileName(
            data.name,
        )} import ${getPythonNameOrDefault(
            services,
            pipeline,
        )}\n\nif __name__ == '__main__':\n${PYTHON_INDENT}${getPythonNameOrDefault(services, pipeline)}()`;
        generatedFiles.set(entryPointFilename, entryPointContent);
    }
    if (!fs.existsSync(parentDirectoryPath)) {
        fs.mkdirSync(parentDirectoryPath, { recursive: true });
    }
    for (const [generatedFilePath, generatedFileContent] of generatedFiles.entries()) {
        fs.writeFileSync(generatedFilePath, generatedFileContent);
    }
    return [...generatedFiles.keys()];
};

const getPythonNameOrDefault = function (
    services: SafeDsServices,
    object: SdsPipeline | SdsSegment | SdsParameter | SdsDeclaration,
) {
    return services.builtins.Annotations.getPythonName(object) || object.name;
};

const formatGeneratedFileName = function (baseName: string): string {
    return `gen_${baseName.replaceAll('%2520', '_').replaceAll(/[ .-]/gu, '_').replaceAll(/\\W/gu, '')}`;
};

const generateModule = function (services: SafeDsServices, module: SdsModule): string {
    const importSet = new Map<String, ImportData>();
    const segments = getModuleMembers(module)
        .filter(isSdsSegment)
        .map((segment) => generateSegment(services, segment, importSet));
    const pipelines = getModuleMembers(module)
        .filter(isSdsPipeline)
        .map((pipeline) => generatePipeline(services, pipeline, importSet));
    const imports = generateImports(Array.from(importSet.values()));
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
};

const generateSegment = function (
    services: SafeDsServices,
    segment: SdsSegment,
    importSet: Map<String, ImportData>,
): string {
    const infoFrame = new GenerationInfoFrame(services, importSet);
    const segmentResult = segment.resultList?.results || [];
    let segmentBlock = generateBlock(segment.body, infoFrame);
    if (segmentResult.length !== 0) {
        segmentBlock += `\nreturn ${segmentResult.map((result) => `${YIELD_PREFIX}${result.name}`).join(', ')}`;
    }
    return expandToString`def ${getPythonNameOrDefault(services, segment)}(${generateParameters(
        segment.parameterList,
        infoFrame,
    )}):\n${PYTHON_INDENT}${segmentBlock}`;
};

const generateParameters = function (parameters: SdsParameterList | undefined, frame: GenerationInfoFrame): string {
    const result = (parameters?.parameters || []).map((param) => generateParameter(param, frame));
    return result.join(', ');
};

const generateParameter = function (
    parameter: SdsParameter,
    frame: GenerationInfoFrame,
    defaultValue: boolean = true,
): string {
    return expandToString`${getPythonNameOrDefault(frame.services, parameter)}${
        defaultValue && parameter.defaultValue !== undefined
            ? '=' + generateExpression(parameter.defaultValue, frame)
            : ''
    }`;
};

const generatePipeline = function (
    services: SafeDsServices,
    pipeline: SdsPipeline,
    importSet: Map<String, ImportData>,
): string {
    const infoFrame = new GenerationInfoFrame(services, importSet);
    return expandToString`def ${getPythonNameOrDefault(services, pipeline)}():\n${PYTHON_INDENT}${generateBlock(
        pipeline.body,
        infoFrame,
    )}`;
};

const generateImports = function (importSet: ImportData[]): string[] {
    const qualifiedImports = importSet
        .filter((importStmt) => importStmt.declarationName === undefined)
        .sort((a, b) => a.importPath.localeCompare(b.importPath))
        .map(generateQualifiedImport);
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
};

const generateQualifiedImport = function (importStmt: ImportData): string {
    if (importStmt.alias === undefined) {
        return `import ${importStmt.importPath}`;
    } else {
        /* c8 ignore next 2 */
        return `import ${importStmt.importPath} as ${importStmt.alias}`;
    }
};

const generateBlock = function (block: SdsBlock, frame: GenerationInfoFrame): string {
    // TODO filter withEffect
    let statements = getStatements(block);
    if (statements.length === 0) {
        return 'pass';
    }
    return expandToString`${statements.map((stmt) => generateStatement(stmt, frame)).join('\n')}`;
};

const generateStatement = function (statement: SdsStatement, frame: GenerationInfoFrame): string {
    if (isSdsAssignment(statement)) {
        return generateAssignment(statement, frame);
    } else if (isSdsExpressionStatement(statement)) {
        const expressionStatement = statement;
        const blockLambdaCode: string[] = [];
        for (const lambda of streamAllContents(expressionStatement.expression).filter(isSdsBlockLambda)) {
            blockLambdaCode.push(generateBlockLambda(lambda, frame));
        }
        blockLambdaCode.push(generateExpression(expressionStatement.expression, frame));
        return expandToString`${blockLambdaCode.join('\n')}`;
    }
    /* c8 ignore next 2 */
    throw new Error(`Unknown SdsStatement: ${statement}`);
};

const generateAssignment = function (assignment: SdsAssignment, frame: GenerationInfoFrame): string {
    const requiredAssignees = isSdsCall(assignment.expression)
        ? getAbstractResults(frame.services.helpers.NodeMapper.callToCallable(assignment.expression)).length
        : /* c8 ignore next */
          1;
    const assignees = getAssignees(assignment);
    if (assignees.some((value) => !isSdsWildcard(value))) {
        const actualAssignees = assignees.map(generateAssignee);
        if (requiredAssignees === actualAssignees.length) {
            return `${actualAssignees.join(', ')} = ${generateExpression(assignment.expression!, frame)}`;
        } else {
            // Add wildcards to match given results
            return `${actualAssignees
                .concat(Array(requiredAssignees - actualAssignees.length).fill('_'))
                .join(', ')} = ${generateExpression(assignment.expression!, frame)}`;
        }
    } else {
        return generateExpression(assignment.expression!, frame);
    }
};

const generateAssignee = function (assignee: SdsAssignee): string {
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
};

const generateBlockLambda = function (blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): string {
    const results = streamBlockLambdaResults(blockLambda);
    let lambdaBlock = generateBlock(blockLambda.body, frame);
    if (!results.isEmpty()) {
        lambdaBlock += `\nreturn ${results.map((result) => `${BLOCK_LAMBDA_RESULT_PREFIX}${result.name}`).join(', ')}`;
    }
    return expandToString`def ${frame.getUniqueLambdaBlockName(blockLambda)}(${generateParameters(
        blockLambda.parameterList,
        frame,
    )}):\n${PYTHON_INDENT}${lambdaBlock}`;
};

const generateExpression = function (expression: SdsExpression, frame: GenerationInfoFrame): string {
    if (isSdsTemplateStringPart(expression)) {
        if (isSdsTemplateStringStart(expression)) {
            return `${formatStringSingleLine(expression.value)}{ `;
        } else if (isSdsTemplateStringInner(expression)) {
            return ` }${formatStringSingleLine(expression.value)}{ `;
        } else if (isSdsTemplateStringEnd(expression)) {
            return ` }${formatStringSingleLine(expression.value)}`;
        }
    }

    const partiallyEvaluatedNode = frame.services.evaluation.PartialEvaluator.evaluate(expression);
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
        return `'${formatStringSingleLine(partiallyEvaluatedNode.value)}'`;
    }
    // Handled after constant expressions: EnumVariant, List, Map

    if (isSdsTemplateString(expression)) {
        return `f'${expression.expressions.map((expr) => generateExpression(expr, frame)).join('')}'`;
    }

    if (isSdsMap(expression)) {
        const mapContent = expression.entries.map(
            (entry) => `${generateExpression(entry.key, frame)}: ${generateExpression(entry.value, frame)}`,
        );
        return `{${mapContent.join(', ')}}`;
    }
    if (isSdsList(expression)) {
        const listContent = expression.elements.map((value) => generateExpression(value, frame));
        return `[${listContent.join(', ')}]`;
    }

    if (isSdsBlockLambda(expression)) {
        return frame.getUniqueLambdaBlockName(expression);
    }
    if (isSdsCall(expression)) {
        if (isSdsReference(expression.receiver) && isSdsFunction(expression.receiver.target.ref)) {
            const pythonCall = frame.services.builtins.Annotations.getPythonCall(expression.receiver.target.ref);
            if (pythonCall) {
                const argumentsMap = getArgumentsMap(expression.argumentList.arguments, frame);
                return generatePythonCall(pythonCall, argumentsMap);
            }
        }
        if (
            isSdsMemberAccess(expression.receiver) &&
            isSdsReference(expression.receiver.member) &&
            isSdsFunction(expression.receiver.member.target.ref)
        ) {
            const pythonCall = frame.services.builtins.Annotations.getPythonCall(expression.receiver.member.target.ref);
            if (pythonCall) {
                const argumentsMap = getArgumentsMap(expression.argumentList.arguments, frame);
                return generatePythonCall(
                    pythonCall,
                    argumentsMap,
                    generateExpression(expression.receiver.receiver, frame),
                );
            }
        }
        const sortedArgs = sortArguments(frame.services, expression.argumentList.arguments);
        return expandToString`${generateExpression(expression.receiver, frame)}(${sortedArgs
            .map((arg) => generateArgument(arg, frame))
            .join(', ')})`;
    }
    if (isSdsExpressionLambda(expression)) {
        return `lambda ${generateParameters(expression.parameterList, frame)}: ${generateExpression(
            expression.result,
            frame,
        )}`;
    }
    if (isSdsInfixOperation(expression)) {
        const leftOperand = generateExpression(expression.leftOperand, frame);
        const rightOperand = generateExpression(expression.rightOperand, frame);
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
    }
    if (isSdsIndexedAccess(expression)) {
        return expandToString`${generateExpression(expression.receiver, frame)}[${generateExpression(
            expression.index,
            frame,
        )}]`;
    }
    if (isSdsMemberAccess(expression)) {
        const member = expression.member?.target.ref!;
        const receiver = generateExpression(expression.receiver, frame);
        if (isSdsEnumVariant(member)) {
            const enumMember = generateExpression(expression.member!, frame);
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
            const memberExpression = generateExpression(expression.member!, frame);
            if (expression.isNullSafe) {
                frame.addImport({ importPath: RUNNER_CODEGEN_PACKAGE });
                return `${RUNNER_CODEGEN_PACKAGE}.safe_access(${receiver}, '${memberExpression}')`;
            } else {
                return `${receiver}.${memberExpression}`;
            }
        }
    }
    if (isSdsParenthesizedExpression(expression)) {
        return expandToString`${generateExpression(expression.expression, frame)}`;
    }
    if (isSdsPrefixOperation(expression)) {
        const operand = generateExpression(expression.operand, frame);
        switch (expression.operator) {
            case 'not':
                return expandToString`not (${operand})`;
            case '-':
                return expandToString`-(${operand})`;
        }
    }
    if (isSdsReference(expression)) {
        const declaration = expression.target.ref!;
        const referenceImport =
            getExternalReferenceNeededImport(frame.services, expression, declaration) ||
            getInternalReferenceNeededImport(frame.services, expression, declaration);
        frame.addImport(referenceImport);
        return referenceImport?.alias || getPythonNameOrDefault(frame.services, declaration);
    }
    /* c8 ignore next 2 */
    throw new Error(`Unknown expression type: ${expression.$type}`);
};

const generatePythonCall = function (
    pythonCall: string,
    argumentsMap: Map<string, string>,
    thisParam: string | undefined = undefined,
): string {
    if (thisParam) {
        argumentsMap.set('this', thisParam);
    }
    // Extract each placeholder from annotation: Match only strings that start with '$'
    // Use look-ahead to only match up to a '.', ',', ')' or a whitespace
    return pythonCall.replace(/\$.+?(?=[\s.,)])/gu, (value) => argumentsMap.get(value.substring(1))!);
};

const getArgumentsMap = function (argumentList: SdsArgument[], frame: GenerationInfoFrame): Map<string, string> {
    const argumentsMap = new Map<string, string>();
    argumentList.reduce((map, value) => {
        map.set(frame.services.helpers.NodeMapper.argumentToParameter(value)?.name!, generateArgument(value, frame));
        return map;
    }, argumentsMap);
    return argumentsMap;
};

const sortArguments = function (services: SafeDsServices, argumentList: SdsArgument[]): SdsArgument[] {
    // $containerIndex contains the index of the parameter in the receivers parameter list
    const parameters = argumentList.map((argument) => {
        return { par: services.helpers.NodeMapper.argumentToParameter(argument), arg: argument };
    });
    return parameters
        .slice()
        .filter((value) => value.par !== undefined)
        .sort((a, b) =>
            a.par !== undefined && b.par !== undefined ? a.par.$containerIndex! - b.par.$containerIndex! : 0,
        )
        .map((value) => value.arg);
};

const generateArgument = function (argument: SdsArgument, frame: GenerationInfoFrame) {
    const parameter = frame.services.helpers.NodeMapper.argumentToParameter(argument);
    return expandToString`${
        parameter !== undefined && !isRequiredParameter(parameter)
            ? generateParameter(parameter, frame, false) + '='
            : ''
    }${generateExpression(argument.value, frame)}`;
};

const getExternalReferenceNeededImport = function (
    services: SafeDsServices,
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
                if (declaration === importedDeclaration.declaration.ref) {
                    if (importedDeclaration.alias !== undefined) {
                        return {
                            importPath: services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                            declarationName: importedDeclaration.declaration?.ref?.name,
                            alias: importedDeclaration.alias.alias,
                        };
                    } else {
                        return {
                            importPath: services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                            declarationName: importedDeclaration.declaration?.ref?.name,
                        };
                    }
                }
            }
        }
        if (isSdsWildcardImport(value)) {
            return {
                importPath: services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                declarationName: declaration.name,
            };
        }
    }
    return undefined;
};

const getInternalReferenceNeededImport = function (
    services: SafeDsServices,
    expression: SdsExpression,
    declaration: SdsDeclaration,
): ImportData | undefined {
    // Root Node is always a module.
    const currentModule = <SdsModule>findRootNode(expression);
    const targetModule = <SdsModule>findRootNode(declaration);
    if (currentModule !== targetModule && !isInStubFile(targetModule)) {
        return {
            importPath: `${
                services.builtins.Annotations.getPythonModule(targetModule) || targetModule.name
            }.${formatGeneratedFileName(getModuleFileBaseName(targetModule))}`,
            declarationName: getPythonNameOrDefault(services, declaration),
        };
    }
    return undefined;
};

const getModuleFileBaseName = function (module: SdsModule): string {
    const filePath = getDocument(module).uri.fsPath;
    return path.basename(filePath, path.extname(filePath));
};

const formatStringSingleLine = function (value: string): string {
    return value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n');
};

interface ImportData {
    readonly importPath: string;
    readonly declarationName?: string;
    readonly alias?: string;
}

class GenerationInfoFrame {
    services: SafeDsServices;
    blockLambdaManager: IdManager<SdsBlockLambda>;
    importSet: Map<String, ImportData>;

    constructor(services: SafeDsServices, importSet: Map<String, ImportData> = new Map<String, ImportData>()) {
        this.services = services;
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

export interface GenerateOptions {
    destination?: string;
}
