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
    isSdsEnum,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsExpressionStatement,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsList,
    isSdsLiteral,
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
import { toConstantExpression } from '../language/partialEvaluation/toConstantExpression.js';
import {
    ConstantBoolean,
    ConstantEnumVariant,
    ConstantFloat,
    ConstantInt,
    ConstantNull,
    ConstantString,
} from '../language/partialEvaluation/model.js';
import {
    abstractResultsOrEmpty,
    assigneesOrEmpty,
    blockLambdaResultsOrEmpty,
    importedDeclarationsOrEmpty,
    importsOrEmpty,
    isRequiredParameter,
    moduleMembersOrEmpty,
    statementsOrEmpty,
} from '../language/helpers/nodeProperties.js';
import { group } from 'radash';
import { IdManager } from '../language/helpers/idManager.js';
import { isInStubFile } from '../language/helpers/fileExtensions.js';

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
    const segments = moduleMembersOrEmpty(module)
        .filter(isSdsSegment)
        .map((segment) => generateSegment(services, segment, importSet));
    const pipelines = moduleMembersOrEmpty(module)
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
            expandToStringWithNL`# Steps ------------------------------------------------------------------------\n\n${segments.join(
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
        // Segment should always have results
        segmentBlock += `\nreturn ${segmentResult.map((result) => result.name).join(', ')}`;
    }
    return expandToString`def ${getPythonNameOrDefault(services, segment)}(${generateParameters(
        segment.parameterList,
        infoFrame,
    )}):\n${PYTHON_INDENT}${segmentBlock}`;
};

const generateParameters = function (parameters: SdsParameterList | undefined, frame: GenerationInfoFrame): string {
    if (parameters === undefined) {
        return '';
    }
    const result = parameters.parameters.map((param) => generateParameter(param, frame));
    return result.join(', ');
};

const generateParameter = function (
    parameter: SdsParameter,
    frame: GenerationInfoFrame,
    defaultValue: boolean = true,
): string {
    return expandToString`${getPythonNameOrDefault(frame.getServices(), parameter)}${
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
    const qualifiedImports = Array.from(importSet)
        .filter((importStmt) => importStmt.declarationName === undefined)
        .sort((a, b) => a.importPath.localeCompare(b.importPath))
        .map(generateImport);
    const groupedImports = Object.entries(
        group(
            Array.from(importSet).filter((importStmt) => importStmt.declarationName !== undefined),
            (importStmt) => importStmt.importPath,
        ),
    ).sort(([key1, _value1], [key2, _value2]) => key1.localeCompare(key2));
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

const generateImport = function (importStmt: ImportData): string {
    if (importStmt.declarationName === undefined && importStmt.alias === undefined) {
        return `import ${importStmt.importPath}`;
    } else if (importStmt.declarationName === undefined && importStmt.alias !== undefined) {
        return `import ${importStmt.importPath} as ${importStmt.alias}`;
    } else if (importStmt.declarationName !== undefined && importStmt.alias === undefined) {
        return `from ${importStmt.importPath} import ${importStmt.declarationName}`;
    } else {
        return `from ${importStmt.importPath} import ${importStmt.declarationName} as ${importStmt.alias}`;
    }
};

const generateBlock = function (block: SdsBlock, frame: GenerationInfoFrame): string {
    // TODO filter withEffect
    let statements = statementsOrEmpty(block);
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
    throw new Error(`Unknown SdsStatement: ${statement}`);
};

const generateAssignment = function (assignment: SdsAssignment, frame: GenerationInfoFrame): string {
    const requiredAssignees = isSdsCall(assignment.expression)
        ? abstractResultsOrEmpty(
              frame.getServices().helpers.NodeMapper.callToCallableOrUndefined(assignment.expression),
          ).length
        : 1;
    const assignees = assigneesOrEmpty(assignment);
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
        return `__block_lambda_${assignee.name}`;
    } else if (isSdsPlaceholder(assignee)) {
        return assignee.name;
    } else if (isSdsWildcard(assignee)) {
        return '_';
    } else if (isSdsYield(assignee)) {
        return assignee.result?.ref?.name!;
    }
    throw new Error(`Unknown SdsAssignment: ${assignee.$type}`);
};

const generateBlockLambda = function (blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): string {
    const lambdaResult = blockLambdaResultsOrEmpty(blockLambda);
    let lambdaBlock = generateBlock(blockLambda.body, frame);
    if (lambdaResult.length !== 0 && lambdaBlock !== 'pass') {
        lambdaBlock += `\nreturn ${lambdaResult.map((result) => `__block_lambda_${result.name}`).join(', ')}`;
    }
    return expandToString`def ${frame.getUniqueLambdaBlockName(blockLambda)}(${generateParameters(
        blockLambda.parameterList,
        frame,
    )}):\n${PYTHON_INDENT}${lambdaBlock}`;
};

const generateExpression = function (expression: SdsExpression, frame: GenerationInfoFrame): string {
    if (isSdsTemplateString(expression)) {
        return `f'${expression.expressions.map((expr) => generateExpression(expr, frame)).join('')}'`;
    }

    if (isSdsTemplateStringPart(expression)) {
        if (isSdsTemplateStringStart(expression)) {
            return `${formatStringSingleLine(expression.value)}{ `;
        } else if (isSdsTemplateStringInner(expression)) {
            return ` }${formatStringSingleLine(expression.value)}{ `;
        } else if (isSdsTemplateStringEnd(expression)) {
            return ` }${formatStringSingleLine(expression.value)}`;
        }
    }

    // TODO move down again, when supported as constant expression
    if (isSdsLiteral(expression) && (isSdsMap(expression) || isSdsList(expression))) {
        if (isSdsMap(expression)) {
            const mapContent = expression.entries.map(
                (entry) => `${generateExpression(entry.key, frame)}: ${generateExpression(entry.value, frame)}`,
            );
            return `{${mapContent.join(', ')}}`;
        } else if (isSdsList(expression)) {
            const listContent = expression.elements.map((value) => generateExpression(value, frame));
            return `[${listContent.join(', ')}]`;
        }
    }

    const potentialConstantExpression = toConstantExpression(expression);
    if (potentialConstantExpression !== null) {
        if (potentialConstantExpression instanceof ConstantBoolean) {
            return potentialConstantExpression.value ? 'True' : 'False';
        } else if (potentialConstantExpression instanceof ConstantInt) {
            return String(potentialConstantExpression.value);
        } else if (potentialConstantExpression instanceof ConstantFloat) {
            const floatValue = potentialConstantExpression.value;
            return Number.isInteger(floatValue) ? `${floatValue}.0` : String(floatValue);
        } else if (potentialConstantExpression === ConstantNull) {
            return 'None';
        } else if (potentialConstantExpression instanceof ConstantString) {
            return `'${formatStringSingleLine(potentialConstantExpression.value)}'`;
        } else if (potentialConstantExpression instanceof ConstantEnumVariant) {
            const enumType = getContainerOfType(potentialConstantExpression.value, isSdsEnum);
            return `${enumType!.name}.${potentialConstantExpression.value.name}`;
        }
    }

    if (isSdsBlockLambda(expression)) {
        return frame.getUniqueLambdaBlockName(expression);
    }
    if (isSdsCall(expression)) {
        const sortedArgs = sortArguments(frame.getServices(), expression.argumentList.arguments);
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
                frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
                return `${RUNNER_CODEGEN_PACKAGE}.eager_or(${leftOperand}, ${rightOperand})`;
            case 'and':
                frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
                return `${RUNNER_CODEGEN_PACKAGE}.eager_and(${leftOperand}, ${rightOperand})`;
            case '?:':
                frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
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
            if (expression.isNullSafe) {
                frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
                return `${RUNNER_CODEGEN_PACKAGE}.safe_access(${receiver}, '${enumMember}')${suffix}`;
            } else {
                return `${receiver}.${enumMember}${suffix}`;
            }
        } else if (isSdsAbstractResult(member)) {
            const resultList = abstractResultsOrEmpty(getContainerOfType(member, isSdsCallable));
            if (resultList.length === 1) {
                return receiver;
            }
            const currentIndex = resultList.indexOf(member);
            return `${receiver}[${currentIndex}]`;
        } else {
            const memberExpression = generateExpression(expression.member!, frame);
            if (expression.isNullSafe) {
                frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
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
            getExternalReferenceNeededImport(frame.getServices(), expression, declaration) ||
            getInternalReferenceNeededImport(frame.getServices(), expression, declaration);
        frame.addImport(referenceImport);
        return referenceImport?.alias || getPythonNameOrDefault(frame.getServices(), declaration);
    }
    throw new Error(`Unknown expression type: ${expression.$type}`);
};

const sortArguments = function (services: SafeDsServices, argumentList: SdsArgument[]): SdsArgument[] {
    // $containerIndex contains the index of the parameter in the receivers parameter list
    const parameters = argumentList.map((argument) => {
        return { par: services.helpers.NodeMapper.argumentToParameterOrUndefined(argument), arg: argument };
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
    const parameter = frame.getServices().helpers.NodeMapper.argumentToParameterOrUndefined(argument);
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
    for (const value of importsOrEmpty(currentModule)) {
        // Verify same package
        if (value.package !== targetModule.name) {
            continue;
        }
        if (isSdsQualifiedImport(value)) {
            const importedDeclarations = importedDeclarationsOrEmpty(value);
            for (const importedDeclaration of importedDeclarations) {
                if (declaration === importedDeclaration.declaration.ref) {
                    if (importedDeclaration.alias !== undefined) {
                        return new ImportData(
                            services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                            importedDeclaration.declaration?.ref?.name,
                            importedDeclaration.alias.alias,
                        );
                    } else {
                        return new ImportData(
                            services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                            importedDeclaration.declaration?.ref?.name,
                        );
                    }
                }
            }
        }
        if (isSdsWildcardImport(value)) {
            return new ImportData(
                services.builtins.Annotations.getPythonModule(targetModule) || value.package,
                declaration.name,
            );
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
        // TODO __skip__ in file name?
        return new ImportData(
            `${
                services.builtins.Annotations.getPythonModule(targetModule) || targetModule.name
            }.${formatGeneratedFileName(getModuleFileBaseName(targetModule))}`,
            getPythonNameOrDefault(services, declaration),
        );
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

class ImportData {
    importPath: string;
    declarationName: string | undefined;
    alias: string | undefined;

    constructor(
        importPath: string,
        declarationName: string | undefined = undefined,
        alias: string | undefined = undefined,
    ) {
        this.importPath = importPath;
        this.declarationName = declarationName;
        this.alias = alias;
    }
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
        return `__block_lambda_${this.blockLambdaManager.assignId(lambda)}`;
    }

    getServices(): SafeDsServices {
        return this.services;
    }
}

export type GenerateOptions = {
    destination?: string;
};
