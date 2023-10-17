import fs from 'fs';
import {expandToString, expandToStringWithNL, findRootNode, getDocument, streamAllContents} from 'langium';
import path from 'path';
import {
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCall,
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
    isSdsResult,
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
    SdsBlockLambdaResult,
    SdsDeclaration,
    SdsExpression,
    SdsExpressionStatement,
    SdsList,
    SdsMap,
    SdsMemberAccess,
    SdsModule,
    SdsParameter,
    SdsParameterList,
    SdsPipeline,
    SdsPlaceholder,
    SdsReference,
    SdsResult,
    SdsSegment,
    SdsStatement,
    SdsYield,
} from '../language/generated/ast.js';
import {extractAstNode, extractDestinationAndName} from './cli-util.js';
import chalk from 'chalk';
import {createSafeDsServices, SafeDsServices} from '../language/safe-ds-module.js';
import {NodeFileSystem} from 'langium/node';
import {toConstantExpression} from '../language/partialEvaluation/toConstantExpression.js';
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
    statementsOrEmpty,
} from '../language/helpers/nodeProperties.js';
import {group} from 'radash';
import {IdManager} from '../language/helpers/idManager.js';
import {isInStubFile} from '../language/helpers/fileExtensions.js';

/* c8 ignore start */
export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
    const module = await extractAstNode<SdsModule>(fileName, services);
    const generatedFilePath = generatePython(services, module, fileName, opts.destination);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Python code generated successfully: ${generatedFilePath}`));
};
/* c8 ignore stop */

const RUNNER_CODEGEN_PACKAGE = 'safeds_runner.codegen';
const PYTHON_INDENT = '    ';

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

export type GenerateOptions = {
    destination?: string;
};

const getPythonNameOrDefault = function (
    services: SafeDsServices,
    object: SdsPipeline | SdsSegment | SdsParameter | SdsDeclaration,
) {
    return services.builtins.Annotations.getPythonName(object) || object.name;
};

const generateAssignee = function (assignee: SdsAssignee): string {
    switch (true) {
        case isSdsBlockLambdaResult(assignee):
            return (assignee as SdsBlockLambdaResult).name;
        case isSdsPlaceholder(assignee):
            return (assignee as SdsPlaceholder).name;
        case isSdsWildcard(assignee):
            return '_';
        case isSdsYield(assignee):
            const yieldResultName = (<SdsYield>assignee).result?.ref?.name;
            if (yieldResultName === undefined) {
                throw new Error('The result of a yield should not be undefined');
            }
            return yieldResultName;
        default:
            throw new Error(`Unknown SdsAssignment: ${assignee.$type}`);
    }
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
            if (assignment.expression !== undefined) {
                return `${actualAssignees.join(', ')} = ${generateExpression(assignment.expression, frame)}`;
            }
            return actualAssignees.join(', ');
        } else {
            // Add wildcards to match given results
            if (assignment.expression !== undefined) {
                return `${actualAssignees
                    .concat(Array(requiredAssignees - actualAssignees.length).fill('_'))
                    .join(', ')} = ${generateExpression(assignment.expression, frame)}`;
            } else {
                return actualAssignees.concat(Array(requiredAssignees - actualAssignees.length).fill('_')).join(', ');
            }
        }
    } else {
        if (assignment.expression !== undefined) {
            return generateExpression(assignment.expression, frame);
        }
        // Only wildcard and no expression
        return '';
    }
};

const generateStatement = function (statement: SdsStatement, frame: GenerationInfoFrame): string {
    switch (true) {
        case isSdsAssignment(statement):
            return generateAssignment(statement as SdsAssignment, frame);
        case isSdsExpressionStatement(statement):
            const expressionStatement = statement as SdsExpressionStatement;
            const blockLambdaCode: string[] = [];
            for (const lambda of streamAllContents(expressionStatement.expression).filter(isSdsBlockLambda)) {
                blockLambdaCode.push(generateBlockLambda(lambda, frame));
            }
            blockLambdaCode.push(generateExpression(expressionStatement.expression, frame));
            return expandToString`${blockLambdaCode.join('\n')}`;
        default:
            throw new Error(`Unknown SdsStatement: ${statement}`);
    }
};

const generateBlockLambda = function (blockLambda: SdsBlockLambda, frame: GenerationInfoFrame): string {
    const lambdaResult = blockLambdaResultsOrEmpty(blockLambda);
    let lambdaBlock = generateBlock(blockLambda.body, frame);
    if (lambdaResult.length !== 0 && lambdaBlock !== 'pass') {
        lambdaBlock += `\nreturn ${lambdaResult.map((result) => result.name).join(', ')}`;
    }
    return expandToString`def ${frame.getUniqueLambdaBlockName(blockLambda)}(${generateParameters(
        blockLambda.parameterList,
        frame,
    )}):\n${PYTHON_INDENT}${lambdaBlock}`;
};

const generateBlock = function (block: SdsBlock, frame: GenerationInfoFrame): string {
    // TODO filter withEffect
    let statements = statementsOrEmpty(block);
    if (statements.length === 0) {
        return 'pass';
    }
    return expandToString`${statements.map((stmt) => generateStatement(stmt, frame)).join('\n')}`;
};

const generateArgument = function (argument: SdsArgument, frame: GenerationInfoFrame) {
    const parameter = frame.getServices().helpers.NodeMapper.argumentToParameterOrUndefined(argument);
    return expandToString`${
        parameter !== undefined && !isRequiredParameter(parameter)
            ? generateParameter(parameter, frame, false) + '='
            : ''
    }${generateExpression(argument.value, frame)}`;
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

const generateExpression = function (expression: SdsExpression, frame: GenerationInfoFrame): string {
    if (isSdsTemplateString(expression)) {
        return `f'${expression.expressions.map((expr) => generateExpression(expr, frame)).join('')}'`;
    }

    if (isSdsTemplateStringPart(expression)) {
        // TODO: really replace both line endings?
        switch (true) {
            case isSdsTemplateStringStart(expression):
                return `${expression.value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n')}{ `;
            case isSdsTemplateStringInner(expression):
                return ` }${expression.value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n')}{ `;
            case isSdsTemplateStringEnd(expression):
                return ` }${expression.value.replaceAll('\r\n', '\\n').replaceAll('\n', '\\n')}`;
        }
    }

    // TODO move down again, when supported as constant expression
    if (isSdsLiteral(expression) && (isSdsMap(expression) || isSdsList(expression))) {
        switch (true) {
            case isSdsMap(expression):
                const map = expression as SdsMap;
                const mapContent = map.entries.map(
                    (entry) => `${generateExpression(entry.key, frame)}: ${generateExpression(entry.value, frame)}`,
                );
                return `{${mapContent.join(', ')}}`;
            case isSdsList(expression):
                const list = expression as SdsList;
                const listContent = list.elements.map((value) => generateExpression(value, frame));
                return `[${listContent.join(', ')}]`;
        }
    }

    const potentialConstantExpression = toConstantExpression(expression);
    if (potentialConstantExpression !== null) {
        switch (true) {
            case potentialConstantExpression instanceof ConstantBoolean:
                return (potentialConstantExpression as ConstantBoolean).value ? 'True' : 'False';
            case potentialConstantExpression instanceof ConstantInt:
                return String((potentialConstantExpression as ConstantInt).value);
            case potentialConstantExpression instanceof ConstantFloat:
                const floatValue = (potentialConstantExpression as ConstantFloat).value;
                return Number.isInteger(floatValue) ? `${floatValue}.0` : String(floatValue);
            case potentialConstantExpression === ConstantNull:
                return 'None';
            case potentialConstantExpression instanceof ConstantString:
                return `'${(potentialConstantExpression as ConstantString).value
                    .replaceAll('\r\n', '\\n')
                    .replaceAll('\n', '\\n')}'`;
            case potentialConstantExpression instanceof ConstantEnumVariant:
                return String((potentialConstantExpression as ConstantEnumVariant).value); // TODO SdsConstantEnumVariant?? generate something useful
        }
    }

    if (isSdsBlockLambda(expression)) {
        const blockLambda = expression as SdsBlockLambda;
        return frame.getUniqueLambdaBlockName(blockLambda);
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
        let memberAccess = expression as SdsMemberAccess;
        const member = memberAccess.member.target.ref;
        const receiver = generateExpression(memberAccess.receiver, frame);
        switch (true) {
            // TODO this should not be possible? Grammar defines SdsBlockLambdaResult as only part of an assignment. There is no way to parse it anywhere else
            /*case isSdsBlockLambdaResult(member):
                return '<TODO: expression:memberaccess:blocklambda>';*/
            case isSdsEnumVariant(member):
                const enumMember = generateExpression(memberAccess.member, frame);
                const suffix = isSdsCall(expression.$container) ? '' : '()';
                if (expression.isNullSafe) {
                    frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
                    return `${RUNNER_CODEGEN_PACKAGE}.safe_access(${receiver}, '${enumMember}')${suffix}`;
                } else {
                    return `${receiver}.${enumMember}${suffix}`;
                }
            case isSdsResult(member):
                const resultList = (<SdsResult>member).$container.results;
                if (resultList.length === 1) {
                    return receiver;
                }
                const currentIndex = resultList.indexOf(<SdsResult>member);
                return `${receiver}[${currentIndex}]`;
            default:
                const memberExpression = generateExpression(memberAccess.member, frame);
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
            default:
                throw new Error('Unknown Prefix Operation Expression');
        }
    }
    if (isSdsReference(expression)) {
        const declaration = (expression as SdsReference).target.ref;
        if (declaration === undefined) {
            throw new Error('Unknown corresponding declaration to reference');
        }
        const referenceImport =
            getExternalReferenceNeededImport(frame.getServices(), expression, declaration) ||
            getInternalReferenceNeededImport(frame.getServices(), expression, declaration);
        frame.addImport(referenceImport);
        return referenceImport?.alias || getPythonNameOrDefault(frame.getServices(), declaration);
    }
    // SdsArgument' | 'SdsChainedExpression' | 'SdsLambda'
    throw new Error(`Unknown expression type: ${expression.$type}`);
};

const getExternalReferenceNeededImport = function (
    services: SafeDsServices,
    expression: SdsExpression,
    declaration: SdsDeclaration,
): ImportData | undefined {
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
            // TODO wildcard import? collisions?
            throw new Error('Wildcard imports are not yet handled');
        }
    }
    return undefined;
};

const getInternalReferenceNeededImport = function (
    services: SafeDsServices,
    expression: SdsExpression,
    declaration: SdsDeclaration,
): ImportData | undefined {
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

const generateParameter = function (
    parameter: SdsParameter | undefined,
    frame: GenerationInfoFrame,
    defaultValue: boolean = true,
): string {
    // TODO isConstant?
    if (parameter === undefined) {
        return '';
    }
    return expandToString`${getPythonNameOrDefault(frame.getServices(), parameter)}${
        defaultValue && parameter.defaultValue !== undefined
            ? '=' + generateExpression(parameter.defaultValue, frame)
            : ''
    }`;
};

const generateParameters = function (parameters: SdsParameterList | undefined, frame: GenerationInfoFrame): string {
    if (parameters === undefined) {
        return '';
    }
    const result = parameters.parameters.map((param) => generateParameter(param, frame));
    return result.join(', ');
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
                .sort((a, b) => (<string>a.declarationName).localeCompare(<string>b.declarationName))
                .map((localValue) =>
                    localValue.alias !== undefined
                        ? `${localValue.declarationName} as ${localValue.alias}`
                        : <string>localValue.declarationName,
                ) || [];
        declaredImports.push(`from ${key} import ${[...new Set(importedDecls)].join(', ')}`);
    }
    return [...new Set(qualifiedImports), ...new Set(declaredImports)];
};

const generateModule = function (services: SafeDsServices, module: SdsModule): string {
    const importSet = new Map<String, ImportData>();
    const segments = streamAllContents(module)
        .filter(isSdsSegment)
        .map((segment) => generateSegment(services, segment, importSet))
        .toArray();
    const pipelines = streamAllContents(module)
        .filter(isSdsPipeline)
        .map((pipeline) => generatePipeline(services, pipeline, importSet))
        .toArray();
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

const formatGeneratedFileName = function (baseName: string): string {
    return `gen_${baseName.replaceAll('%2520', '_').replaceAll(/[ .-]/gu, '_').replaceAll(/\\W/gu, '')}`;
};

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
    // const fileNode = new CompositeGeneratorNode();
    // fileNode.append('"use strict";', NL, NL);
    // model.greetings.forEach(greeting => fileNode.append(`console.log('Hello, ${greeting.person.ref?.name}!');`, NL));

    if (!fs.existsSync(parentDirectoryPath)) {
        fs.mkdirSync(parentDirectoryPath, { recursive: true });
    }
    for (const [generatedFilePath, generatedFileContent] of generatedFiles.entries()) {
        fs.writeFileSync(generatedFilePath, generatedFileContent);
    }
    return [...generatedFiles.keys()];
};
