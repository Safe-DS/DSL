import { ILexingError, IRecognitionException } from 'chevrotain';
import { URI, AstNode, LangiumDocument, AstNodeLocator } from 'langium';
import { SafeDsLogger } from '../../communication/safe-ds-messaging-provider.js';
import { SdsModule, isSdsPipeline, SdsStatement, isSdsSegment, SdsAnnotatedObject } from '../../generated/ast.js';
import { documentToJson, saveJson } from './tools/debug-utils.js';
import { Statement } from './statement.js';
import { SafeDsAnnotations } from '../../builtins/safe-ds-annotations.js';
import { SafeDsTypeComputer } from '../../typing/safe-ds-type-computer.js';
import { CustomError, Graph } from '../types.js';
import { Segment } from './segment.js';

export class Parser {
    private lastId: number;
    private readonly logger?: SafeDsLogger;
    private readonly documentUri: URI;
    private errorList: CustomError[];
    public graph: Graph;
    private AstNodeLocator: AstNodeLocator;
    private Annotations: SafeDsAnnotations;
    private TypeComputer: SafeDsTypeComputer;

    public constructor(
        documentUri: URI,
        graphType: 'pipeline' | 'segment',
        Annotations: SafeDsAnnotations,
        astNodeLocator: AstNodeLocator,
        typeComputer: SafeDsTypeComputer,
        logger?: SafeDsLogger,
        lastId?: number,
    ) {
        this.errorList = [];
        this.documentUri = documentUri;
        this.graph = new Graph(graphType);
        this.lastId = lastId ?? 0;
        this.logger = logger;
        this.Annotations = Annotations;
        this.AstNodeLocator = astNodeLocator;
        this.TypeComputer = typeComputer;
    }

    public getNewId() {
        return this.lastId++;
    }

    public hasErrors() {
        return this.errorList.length > 0;
    }

    public getUniquePath(node: AstNode) {
        return this.AstNodeLocator.getAstNodePath(node);
    }

    public getCategory(node: SdsAnnotatedObject) {
        return this.Annotations.getCategory(node);
    }

    public computeType(node: AstNode) {
        return this.TypeComputer.computeType(node);
    }

    public pushError(message: string, origin?: AstNode) {
        const error = new CustomError('block', this.constructErrorMessage(message, origin));
        this.errorList.push(error);
        this.logger?.error(message);
        return error;
    }

    private constructErrorMessage(message: string, origin?: AstNode) {
        const uri = origin?.$cstNode?.root.astNode.$document?.uri.fsPath ?? '';
        const position = origin?.$cstNode
            ? `:${origin.$cstNode.range.start.line + 1}:${origin.$cstNode.range.start.character + 1}`
            : '';

        return `${uri}${position} - ${message}`;
    }

    public pushLexerErrors(error: ILexingError) {
        const uri = this.documentUri.toString();
        const position = error.line && error.column ? `:${error.line + 1}:${error.column + 1}` : '';

        const message = `${uri}${position} - Lexer Error: ${error.message}`;
        const fullError = `${uri}${position} - ${message}`;

        this.pushError(fullError);
    }

    public pushParserErrors(error: IRecognitionException) {
        const uri = this.documentUri.toString();
        const position =
            error.token.startLine && error.token.startColumn
                ? `:${error.token.startLine + 1}:${error.token.startColumn + 1}`
                : '';

        const message = `${uri}${position} - Parser Error: ${error.message}`;
        const fullError = `${uri}${position} - ${message}`;

        this.pushError(fullError);
    }

    public getResult() {
        return { graph: this.graph, errorList: this.errorList };
    }

    public parsePipeline(document: LangiumDocument<AstNode>, debug: boolean = false) {
        if (debug) {
            // Creates a text document, that contains the json representation of the ast
            saveJson(documentToJson(document, 16), document.uri);
        }

        const root = document.parseResult.value as SdsModule;
        const pipelines = root.members.filter((member) => isSdsPipeline(member));

        if (pipelines.length !== 1) {
            this.pushError('Pipeline must be defined exactly once');
            return;
        }
        const pipeline = pipelines[0]!;
        const block = pipeline.body;
        const statementList: SdsStatement[] = block.statements;
        statementList.forEach((statement) => {
            Statement.parse(statement, this);
        });

        this.graph.uniquePath = this.getUniquePath(pipeline);
        this.graph.name = pipeline.name;
    }

    public static parseSegments(
        document: LangiumDocument<AstNode>,
        Annotations: SafeDsAnnotations,
        astNodeLocator: AstNodeLocator,
        typeComputer: SafeDsTypeComputer,
        logger?: SafeDsLogger,
    ) {
        const root = document.parseResult.value as SdsModule;
        const segmentListRaw = root.members.filter((member) => isSdsSegment(member));

        const segmentListParsed = segmentListRaw.map((segment) => {
            const segmentParser = new Parser(
                document.uri,
                'segment',
                Annotations,
                astNodeLocator,
                typeComputer,
                logger,
            );
            return Segment.parse(segment, segmentParser);
        });
        const segmentList = segmentListParsed.map((element) => element.segment);
        const errorList = segmentListParsed.map((element) => element.errorList).flat();
        return { segmentList, errorList };
    }
}
