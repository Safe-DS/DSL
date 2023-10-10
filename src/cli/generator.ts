import fs from 'fs';
import {
    CompositeGeneratorNode,
    expandToString,
    expandToStringWithNL,
    findLocalReferences,
    streamAllContents,
    toString,
    getDocument,
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
    isSdsSegment,
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
    SdsCall,
    SdsCallable,
    SdsExpression,
    SdsExpressionLambda,
    SdsExpressionStatement,
    SdsList,
    SdsMap,
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
    assigneesOrEmpty,
    parametersOrEmpty,
    resultsOrEmpty,
    statementsOrEmpty,
} from '../language/helpers/nodeProperties.js';

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

export type GenerateOptions = {
    destination?: string;
};

const getPythonName = function (annotatedObject: SdsAnnotatedObject) {
    if (annotatedObject.annotationCalls === undefined) {
        return undefined;
    }
    // TODO python name
    for (const annotation of annotationCallsOrEmpty(annotatedObject)) {
        if (annotation.annotation.ref !== undefined && annotation.annotation.ref.name === 'PythonName') {
            return JSON.stringify(annotation.annotation.ref);
        }
    }
    return undefined;
};

const generateAssignee = function (assignee: SdsAssignee): string {
    switch (true) {
        case isSdsBlockLambdaResult(assignee):
            return '<TODO: block-lambda-assignemnt>';
        case isSdsPlaceholder(assignee):
            return (assignee as SdsPlaceholder).name;
        case isSdsWildcard(assignee):
            return '_';
        case isSdsYield(assignee):
            // TODO handle (assignee as SdsYield).
            return '<TODO: yield:assignment>';
    }
};

const generateAssignment = function (assignment: SdsAssignment): string {
    const requiredAssignees = isSdsCallable(assignment.expression)
        ? abstractResultsOrEmpty(assignment.expression as SdsCallable).length
        : 1;
    const actualAssignees = assigneesOrEmpty(assignment).map(generateAssignee);
    return actualAssignees.concat(Array(requiredAssignees - actualAssignees.length).fill('_')).join(', ');
};

const generateStatement = function (statement: SdsStatement): string {
    switch (true) {
        case isSdsAssignment(statement):
            return generateAssignment(statement as SdsAssignment);
        case isSdsExpressionStatement(statement):
            return generateExpression((statement as SdsExpressionStatement).expression);
        default:
            throw new Error(`Unknown SdsStatement: ${statement}`);
    }
};

const generateBlock = function (block: SdsBlock): string {
    let statements = statementsOrEmpty(block);
    if (statements.length === 0) {
        return 'pass';
    }
    return expandToString`${statements.map(generateStatement).join('\n')}`;
};

const generateType = function (type: SdsType | undefined): string | null {
    if (type === undefined) {
        // TODO do something
        return '<TODO: type; undefined>';
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

const generateArgument = function (argument: SdsArgument) {
    return expandToString`${
        argument.parameter !== undefined && argument.parameter.ref !== undefined
            ? generateParameter(argument.parameter.ref) + '='
            : ''
    }${generateExpression(argument.value)}`;
};

const generateExpression = function (expression: SdsExpression): string {
    if (isSdsTemplateString(expression)) {
        return expandToString`f'${expression.expressions.map(generateExpression).join('')}'`;
    }

    if (isSdsTemplateStringPart(expression)) {
        switch (true) {
            case isSdsTemplateStringStart(expression):
                return `${expression.value.replace('\n', '\\n')}{ `;
            case isSdsTemplateStringInner(expression):
                return ` }${expression.value.replace('\n', '\\n')}{ `;
            case isSdsTemplateStringEnd(expression):
                return ` }${expression.value.replace('\n', '\\n')}`;
        }
    }

    const potentialConstantExpression = toConstantExpressionOrUndefined(expression);
    if (potentialConstantExpression !== null) {
        switch (true) {
            case potentialConstantExpression instanceof SdsConstantBoolean:
                return expandToString`${(potentialConstantExpression as SdsConstantBoolean).value ? 'True' : 'False'}`;
            case potentialConstantExpression instanceof SdsConstantFloat:
                return expandToString`${(potentialConstantExpression as SdsConstantFloat).value}`;
            case potentialConstantExpression instanceof SdsConstantInt:
                return expandToString`${(potentialConstantExpression as SdsConstantInt).value}`;
            case potentialConstantExpression instanceof SdsConstantNull:
                return expandToString`None`;
            case potentialConstantExpression instanceof SdsConstantString:
                return expandToString`${(potentialConstantExpression as SdsConstantString).value.replace('\n', '\\n')}`;
            case potentialConstantExpression instanceof SdsConstantEnumVariant:
                return expandToString`${(potentialConstantExpression as SdsConstantEnumVariant).value}`; // TODO SdsConstantEnumVariant?? generate something useful
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
                return expandToString`'${expression as SdsMap}'`; // TODO SdsMap??
            case isSdsList(expression):
                return expandToString`'${expression as SdsList}'`; // TODO SdsList??
            default:
                throw new Error(`Unknown SdsLiteral: ${expression}`);
        }
    }
    if (isSdsBlockLambda(expression)) {
        // TODO do something
        return '<TODO: expr:blocklambda>';
    }
    if (isSdsCall(expression)) {
        return expandToString`${generateExpression(expression.receiver)}(${expression.argumentList.arguments
            .map(generateArgument)
            .join(', ')})`;
    }
    if (isSdsExpressionLambda(expression)) {
        return expandToString`lambda ${generateParameters(expression.parameterList)}: ${generateExpression(
            expression.result,
        )}`;
    }
    if (isSdsInfixOperation(expression)) {
        const leftOperand = generateExpression(expression.leftOperand);
        const rightOperand = generateExpression(expression.rightOperand);
        // TODO import codegen somehow
        switch (expression.operator) {
            case 'or':
                return expandToString`${RUNNER_CODEGEN_PACKAGE}.eager_or(${leftOperand}, ${rightOperand})`;
            case 'and':
                return expandToString`${RUNNER_CODEGEN_PACKAGE}.eager_and(${leftOperand}, ${rightOperand})`;
            case '?:':
                return expandToString`${RUNNER_CODEGEN_PACKAGE}.eager_elvis(${leftOperand}, ${rightOperand})`;
            case '===':
                return expandToString`(${leftOperand}) is (${rightOperand})`;
            case '!==':
                return expandToString`(${leftOperand}) is not (${rightOperand})`;
            default:
                return expandToString`(${leftOperand}) ${expression.operator} (${rightOperand})`;
        }
    }
    if (isSdsIndexedAccess(expression)) {
        return expandToString`${generateExpression(expression.receiver)}[${generateExpression(expression.index)}]`;
    }
    if (isSdsMemberAccess(expression)) {
        // TODO return memberaccess??
        return '<TODO: expression:memberaccess>';
    }
    if (isSdsParenthesizedExpression(expression)) {
        return expandToString`(${generateExpression(expression.expression)})`;
    }
    if (isSdsPrefixOperation(expression)) {
        const operand = generateExpression(expression.operand);
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
        return declaration.name;
    }
    // SdsArgument' | 'SdsChainedExpression' | 'SdsLambda'
    return `<TODO: expression:with type:${expression.$type}>`;
};

const generateParameter = function (parameter: SdsParameter | undefined, asNamedAssignment: boolean = false): string {
    // TODO annotations? annotationCalls annotationCallList
    // TODO isConstant?
    if (parameter === undefined) {
        return '';
    }
    if (!asNamedAssignment) {
        return expandToString`${parameter.name}`;
    }
    const parameterType = generateType(parameter.type);
    return expandToString`${parameter.name}${parameterType !== null ? `: ${parameterType}` : ''}${
        parameter.defaultValue !== undefined ? '=' + generateExpression(parameter.defaultValue) : ''
    }`; // TODO correspondingPythonName???
};

const generateParameters = function (parameters: SdsParameterList | undefined): string {
    if (parameters === undefined) {
        return '';
    }
    const result = parameters.parameters.map(generateParameter);
    return result.join(', ');
};

const generateResults = function (result: SdsResultList | undefined): string {
    if (result === undefined || result.results.length === 0) {
        return '';
    }
    // TODO do something
    return '<TODO: resultList>';
};

const generateSegment = function (segment: SdsSegment): string {
    // TODO annotations PythonName
    return expandToString`def ${getPythonName(segment) || segment.name}(${generateParameters(segment.parameterList)})${
        segment.resultList !== undefined && segment.resultList.results.length !== 0
            ? ' -> ' + generateResults(segment.resultList)
            : ''
    }:\n${PYTHON_INDENT}${generateBlock(segment.body)}`;
};

const generatePipeline = function (pipeline: SdsPipeline): string {
    // TODO annotations PythonName
    return expandToString`def ${getPythonName(pipeline) || pipeline.name}():\n${PYTHON_INDENT}${generateBlock(
        pipeline.body,
    )}`;
};

const generateModule = function (module: SdsModule): string {
    const segments = streamAllContents(module).filter(isSdsSegment).map(generateSegment).toArray();
    const pipelines = streamAllContents(module).filter(isSdsPipeline).map(generatePipeline).toArray();
    const output: string[] = [];
    if (segments.length > 0) {
        output.push(
            expandToString`# Steps ------------------------------------------------------------------------\n\n${segments.join(
                '\n\n',
            )}`,
        );
    }
    if (pipelines.length > 0) {
        output.push(
            expandToString`# Pipelines --------------------------------------------------------------------\n\n${pipelines.join(
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
    const packagePath = module.name.split('.');

    const parentDirectoryPath = path.join(data.destination, ...packagePath);

    const generatedFiles = new Map<string, string>();
    generatedFiles.set(`${path.join(parentDirectoryPath, `gen_${data.name}`)}.py`, generateModule(module));
    for (const pipeline of streamAllContents(module).filter(isSdsPipeline)) {
        const entryPointFilename = `${path.join(parentDirectoryPath, `gen_${data.name}_${pipeline.name}`)}.py`; // TODO python name?
        const entryPointContent = expandToStringWithNL`from gen_${data.name} import ${pipeline.name}\n\nif __name__ == '__main__':\n${PYTHON_INDENT}${pipeline.name}()`;
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
