import fs from 'fs';
import {
    CompositeGeneratorNode,
    expandToString,
    expandToStringWithNL,
    findLocalReferences,
    streamAllContents,
    toString,
    getDocument,
    Reference,
} from 'langium';
import path from 'path';
import {
    isQualifiedName,
    isSdsAssignee,
    isSdsAssignment,
    isSdsBlockLambda,
    isSdsBlockLambdaResult,
    isSdsCall,
    isSdsCallable,
    isSdsCallableType,
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsExpressionStatement,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsList,
    isSdsLiteral,
    isSdsLiteralType,
    isSdsMap,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsNamedType,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsResult,
    isSdsSegment,
    isSdsString,
    isSdsTemplateString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringPart,
    isSdsTemplateStringStart,
    isSdsUnionType,
    isSdsWildcard,
    isSdsYield,
    SdsAnnotatedObject,
    SdsArgument,
    SdsArgumentList,
    SdsAssignee,
    SdsAssignment,
    SdsBlock,
    SdsBlockLambda,
    SdsBlockLambdaResult,
    SdsCall,
    SdsCallable,
    SdsDeclaration,
    SdsEnumVariant,
    SdsExpression,
    SdsExpressionLambda,
    SdsExpressionStatement,
    SdsList,
    SdsMap,
    SdsMemberAccess,
    SdsModule,
    SdsNamedType,
    SdsParameter,
    SdsParameterList,
    SdsPipeline,
    SdsPlaceholder,
    SdsPrefixOperation,
    SdsReference,
    SdsResultList,
    SdsSegment,
    SdsStatement,
    SdsType,
    SdsYield,
} from '../language/generated/ast.js';
import { extractAstNode, extractDestinationAndName } from './cli-util.js';
import chalk from 'chalk';
import { createSafeDsServices } from '../language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { toConstantExpressionOrUndefined } from '../language/partialEvaluation/toConstantExpressionOrUndefined.js';
import {
    SdsConstantBoolean,
    SdsConstantEnumVariant,
    SdsConstantFloat,
    SdsConstantInt,
    SdsConstantNull,
    SdsConstantString,
} from '../language/partialEvaluation/model.js';
import {
    abstractResultsOrEmpty,
    annotationCallsOrEmpty,
    argumentsOrEmpty,
    assigneesOrEmpty,
    blockLambdaResultsOrEmpty,
    callParametersOrEmpty,
    callResultsOrEmpty,
    isRequiredParameter,
    parametersOrEmpty,
    resultsOrEmpty,
    statementsOrEmpty,
} from '../language/helpers/nodeProperties.js';
import { group } from 'radash';
import { IdManager } from '../language/helpers/idManager.js';

/* c8 ignore start */
export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSafeDsServices(NodeFileSystem).SafeDs;
    const module = await extractAstNode<SdsModule>(fileName, services);
    const generatedFilePath = generatePython(module, fileName, opts.destination);
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Python code generated successfully: ${generatedFilePath}`));
};
/* c8 ignore stop */

const RUNNER_CODEGEN_PACKAGE = 'safeds_runner.codegen';
const PYTHON_INDENT = '    ';

class GenerationInfoFrame {
    blockLambdaManager: IdManager<SdsBlockLambda>;
    importSet: Set<ImportData>;

    constructor(importSet: Set<ImportData> = new Set<ImportData>()) {
        this.blockLambdaManager = new IdManager<SdsBlockLambda>();
        this.importSet = importSet;
    }

    addImport(importData: ImportData) {
        this.importSet.add(importData);
    }

    getUniqueLambdaBlockName(lambda: SdsBlockLambda): string {
        return `__block_lambda_${this.blockLambdaManager.assignId(lambda)}`;
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

const getPythonNameOrDefault = function (object: SdsPipeline | SdsSegment | SdsParameter | SdsDeclaration) {
    return getPythonName(object) || object.name;
};
const getPythonName = function (annotatedObject: SdsAnnotatedObject) {
    let annotationCalls = annotationCallsOrEmpty(annotatedObject);
    if (annotationCalls.length === 0) {
        return undefined;
    }
    for (const annotationCall of annotationCalls) {
        if (annotationCall.annotation.ref !== undefined && annotationCall.annotation.ref.name === 'PythonName') {
            const argumentsArray = argumentsOrEmpty(annotationCall);
            if (argumentsArray.length !== 0) {
                if (isSdsString(argumentsArray[0].value)) {
                    return argumentsArray[0].value.value;
                }
            }
        }
    }
    return undefined;
};

const getPythonModuleName = function (annotatedObject: SdsAnnotatedObject): string | undefined {
    let annotationCalls = annotationCallsOrEmpty(annotatedObject);
    if (annotationCalls.length === 0) {
        return undefined;
    }
    for (const annotationCall of annotationCalls) {
        if (annotationCall.annotation.ref !== undefined && annotationCall.annotation.ref.name === 'PythonModule') {
            const argumentsArray = argumentsOrEmpty(annotationCall);
            if (argumentsArray.length !== 0) {
                if (isSdsString(argumentsArray[0].value)) {
                    return argumentsArray[0].value.value;
                }
            }
        }
    }
    return undefined;
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
            // TODO handle (assignee as SdsYield).
            return '<TODO: yield:assignment>';
        default:
            // TODO more assignees
            throw new Error(`Unknown SdsAssignment: ${assignee.$type}`);
    }
};

const generateAssignment = function (assignment: SdsAssignment, frame: GenerationInfoFrame): string {
    const requiredAssignees =
        isSdsCallable(assignment.expression) || isSdsCall(assignment.expression)
            ? callResultsOrEmpty(assignment.expression as SdsCallable).length
            : 1;
    const actualAssignees = assigneesOrEmpty(assignment).map(generateAssignee);
    if (requiredAssignees === actualAssignees.length) {
        if (assignment.expression !== undefined) {
            return `${actualAssignees.join(', ')} = ${generateExpression(assignment.expression, frame)}`;
        }
        return actualAssignees.join(', ');
    }
    if (assignment.expression !== undefined) {
        console.info('Required: ' + requiredAssignees);
        console.info('Actual: ' + actualAssignees.length);
        console.info('Assignees: ' + actualAssignees.join(', '));
        console.info(
            'Expected: ' +
                abstractResultsOrEmpty(assignment.expression as SdsCallable)
                    .map((a) => a.$type + ' - ' + a.name)
                    .join(', '),
        );
        console.info('Expr: ' + assignment.expression.$type);
        return `${actualAssignees
            .concat(Array(requiredAssignees - actualAssignees.length).fill('_'))
            .join(', ')} = ${generateExpression(assignment.expression, frame)}`;
    } else {
        return actualAssignees.concat(Array(requiredAssignees - actualAssignees.length).fill('_')).join(', ');
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
    if (lambdaResult.length !== 0) {
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

const generateType = function (type: SdsType | undefined): string | null {
    if (type === undefined) {
        return null;
    }
    switch (true) {
        case isSdsCallableType(type):
            // TODO do something
            return '<TODO: type:callable>';
        case isSdsLiteralType(type):
            // TODO do something
            return '<TODO: type:literal>';
        case isSdsMemberType(type):
            // TODO do something
            return '<TODO: type:member>';
        case isSdsNamedType(type):
            const namedType = type as SdsNamedType;
            if (namedType.typeArgumentList === undefined) {
                return null;
            }
            // TODO do something
            return '<TODO: type:named>';
        case isSdsUnionType(type):
            // TODO do something
            return '<TODO: type:union>';
        default:
            throw new Error(`Unknown SdsType: ${type}`);
    }
};

const generateArgument = function (argument: SdsArgument, frame: GenerationInfoFrame) {
    return expandToString`${
        argument.parameter !== undefined &&
        argument.parameter.ref !== undefined &&
        !isRequiredParameter(argument.parameter.ref)
            ? generateParameter(argument.parameter.ref, frame, false) + '='
            : ''
    }${generateExpression(argument.value, frame)}`;
};

const sortArguments = function (argumentList: SdsArgument[], call: SdsCall): SdsArgument[] {
    // $containerIndex contains the index of the parameter in the receivers parameter list
    const parameters = callParametersOrEmpty(call);
    const sortedArgs = argumentList
        .slice()
        .filter((value) => value.parameter !== undefined && value.parameter.ref !== undefined)
        .sort(
            (a, b) =>
                parameters.indexOf(<SdsParameter>(<Reference<SdsParameter>>b.parameter).ref) -
                parameters.indexOf(<SdsParameter>(<Reference<SdsParameter>>a.parameter).ref),
        );
    return sortedArgs.length === 0 ? argumentList : sortedArgs;
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

    const potentialConstantExpression = toConstantExpressionOrUndefined(expression);
    if (potentialConstantExpression !== null) {
        switch (true) {
            case potentialConstantExpression instanceof SdsConstantBoolean:
                return (potentialConstantExpression as SdsConstantBoolean).value ? 'True' : 'False';
            case potentialConstantExpression instanceof SdsConstantInt:
                return String((potentialConstantExpression as SdsConstantInt).value);
            case potentialConstantExpression instanceof SdsConstantFloat:
                const floatValue = (potentialConstantExpression as SdsConstantFloat).value;
                return Number.isInteger(floatValue) ? `${floatValue}.0` : String(floatValue);
            case potentialConstantExpression instanceof SdsConstantNull:
                return 'None';
            case potentialConstantExpression instanceof SdsConstantString:
                return `'${(potentialConstantExpression as SdsConstantString).value
                    .replaceAll('\r\n', '\\n')
                    .replaceAll('\n', '\\n')}'`;
            case potentialConstantExpression instanceof SdsConstantEnumVariant:
                return String((potentialConstantExpression as SdsConstantEnumVariant).value); // TODO SdsConstantEnumVariant?? generate something useful
            default:
                throw new Error(`Unknown SdsLiteral: ${expression}`);
        }
    }

    if (isSdsLiteral(expression)) {
        switch (true) {
            // These should be handled by ConstantExpression
            /*case isSdsBoolean(expression):
                return expandToString`${(expression as SdsBoolean).value ? 'True' : 'False'}`;
            case isSdsFloat(expression):
                return expandToString`${(expression as SdsFloat).value}`;
            case isSdsInt(expression):
                return expandToString`${(expression as SdsInt).value}`;
            case isSdsNull(expression):
                return expandToString`None`;
            case isSdsString(expression):
                return expandToString`'${(expression as SdsString).value}'`;*/
            case isSdsMap(expression):
                return `'${expression as SdsMap}'`; // TODO SdsMap??
            case isSdsList(expression):
                return `'${expression as SdsList}'`; // TODO SdsList??
            default:
                throw new Error(`Unknown SdsLiteral: ${expression}`);
        }
    }
    if (isSdsBlockLambda(expression)) {
        const blockLambda = expression as SdsBlockLambda;
        return frame.getUniqueLambdaBlockName(blockLambda);
    }
    if (isSdsCall(expression)) {
        // TODO sort arguments to target order
        const sortedArgs = sortArguments(expression.argumentList.arguments, expression);
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
            case isSdsBlockLambdaResult(member):
                let res = member as SdsBlockLambdaResult;
                return '<TODO: expression:memberaccess:blocklambda>';
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
                return '<TODO: expression:memberaccess:sdsresult>';
            default:
                const memberExpression = generateExpression(memberAccess.member, frame);
                if (expression.isNullSafe) {
                    frame.addImport(new ImportData(RUNNER_CODEGEN_PACKAGE));
                    return `${RUNNER_CODEGEN_PACKAGE}.safe_access(${receiver}, '${memberExpression}')`;
                } else {
                    return `${receiver}.${memberExpression}`;
                }
        }
        return '<TODO: expression:memberaccess>';
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
        const currentDocument = getDocument(expression);
        // TODO generate reference
        // TODO import
        const declaration = (expression as SdsReference).target.ref;
        //return '<TODO: expression:reference>';
        if (declaration === undefined) {
            return '<TODO undefined declaration for expression:reference>';
        }
        return getPythonNameOrDefault(declaration); // TODO python name, may be fixed with reference / import
    }
    // SdsArgument' | 'SdsChainedExpression' | 'SdsLambda'
    return `<TODO: expression:with type:${expression.$type}>`;
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
    return expandToString`${getPythonNameOrDefault(parameter)}${
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

const generateResults = function (result: SdsResultList | undefined): string {
    if (result === undefined || result.results.length === 0) {
        return '';
    }
    // TODO do something
    return '<TODO: resultList>';
};

const generateSegment = function (segment: SdsSegment, importSet: Set<ImportData>): string {
    const infoFrame = new GenerationInfoFrame(importSet);
    return expandToString`def ${getPythonNameOrDefault(segment)}(${generateParameters(
        segment.parameterList,
        infoFrame,
    )})${
        segment.resultList !== undefined && segment.resultList.results.length !== 0
            ? ' -> ' + generateResults(segment.resultList)
            : ''
    }:\n${PYTHON_INDENT}${generateBlock(segment.body, infoFrame)}`;
};

const generatePipeline = function (pipeline: SdsPipeline, importSet: Set<ImportData>): string {
    const infoFrame = new GenerationInfoFrame(importSet);
    return expandToString`def ${getPythonNameOrDefault(pipeline)}():\n${PYTHON_INDENT}${generateBlock(
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

const generateImports = function (importSet: Set<ImportData>): string[] {
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

const generateModule = function (module: SdsModule): string {
    const importSet = new Set<ImportData>();
    const segments = streamAllContents(module)
        .filter(isSdsSegment)
        .map((segment) => generateSegment(segment, importSet))
        .toArray();
    const pipelines = streamAllContents(module)
        .filter(isSdsPipeline)
        .map((pipeline) => generatePipeline(pipeline, importSet))
        .toArray();
    const imports = generateImports(importSet);
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

export const generatePython = function (
    module: SdsModule,
    filePath: string,
    destination: string | undefined,
): string[] {
    const data = extractDestinationAndName(filePath, destination);
    const pythonModuleName = getPythonModuleName(module);
    const packagePath = pythonModuleName === undefined ? module.name.split('.') : [pythonModuleName];
    const parentDirectoryPath = path.join(data.destination, ...packagePath);

    const generatedFiles = new Map<string, string>();
    generatedFiles.set(`${path.join(parentDirectoryPath, `gen_${data.name}`)}.py`, generateModule(module));
    for (const pipeline of streamAllContents(module).filter(isSdsPipeline)) {
        const entryPointFilename = `${path.join(
            parentDirectoryPath,
            `gen_${data.name}_${getPythonNameOrDefault(pipeline)}`,
        )}.py`;
        const entryPointContent = expandToStringWithNL`from gen_${data.name} import ${getPythonNameOrDefault(
            pipeline,
        )}\n\nif __name__ == '__main__':\n${PYTHON_INDENT}${getPythonNameOrDefault(pipeline)}()`;
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
