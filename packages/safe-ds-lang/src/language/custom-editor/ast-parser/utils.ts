import { AstNode, URI } from "langium";
import { SafeDsMessagingProvider } from "../../communication/safe-ds-messaging-provider.js";
import { Call } from "./call.js";
import { Edge } from "./edge.js";
import { Placeholder } from "./placeholder.js";
import { GenericExpression } from "./expression.js";
import { ILexingError, IRecognitionException } from "chevrotain";
import { CustomError } from "../global.js";

export class Utils {
    static lastId: number;
    static logger: SafeDsMessagingProvider;
    static documentUri: URI;
    static errorList: CustomError[];
    static placeholderList: Placeholder[];
    static callList: Call[];
    static genericExpressionList: GenericExpression[];
    static edgeList: Edge[];

    public static initialize(
        logger: SafeDsMessagingProvider,
        documentUri: URI,
    ) {
        Utils.errorList = [];
        Utils.placeholderList = [];
        Utils.callList = [];
        Utils.genericExpressionList = [];
        Utils.edgeList = [];
        Utils.lastId = 0;
        Utils.logger = logger;
        Utils.documentUri = documentUri;
    }

    private static constructErrorMessage(message: string, origin?: AstNode) {
        const uri = origin?.$cstNode?.root.astNode.$document?.uri.fsPath ?? "";
        const position = origin?.$cstNode
            ? `:${origin.$cstNode.range.start.line + 1}:${origin.$cstNode.range.start.character + 1}`
            : "";

        return `${uri}${position} - ${message}`;
    }

    public static log(message: string) {
        Utils.logger.debug("AstParser", message);
    }

    public static logError(message: string, origin?: AstNode) {
        Utils.logger.error(
            "AstParser",
            origin ? Utils.constructErrorMessage(message, origin) : message,
        );
    }

    public static pushError(message: string, origin?: AstNode) {
        const error = new CustomError(
            "block",
            Utils.constructErrorMessage(message, origin),
        );
        Utils.errorList.push(error);
        Utils.logError(error.message);
        return error;
    }

    public static pushLexerErrors(error: ILexingError) {
        const uri = Utils.documentUri.toString();
        const position =
            error.line && error.column
                ? `:${error.line + 1}:${error.column + 1}`
                : "";

        const message = `${uri}${position} - Lexer Error: ${error.message}`;

        const fullError = `${uri}${position} - ${message}`;
        Utils.errorList.push(new CustomError("block", fullError));
        Utils.logError(message);
    }

    public static pushParserErrors(error: IRecognitionException) {
        const uri = Utils.documentUri.toString();
        const position =
            error.token.startLine && error.token.startColumn
                ? `:${error.token.startLine + 1}:${error.token.startColumn + 1}`
                : "";

        const message = `${uri}${position} - Parser Error: ${error.message}`;

        const fullError = `${uri}${position} - ${message}`;
        Utils.errorList.push(new CustomError("block", fullError));
        Utils.logError(message);
    }

    public static getNewId() {
        return Utils.lastId++;
    }
}

export const zip = <A, B>(arrayA: A[], arrayB: B[]): [A, B][] => {
    const minLength = Math.min(arrayA.length, arrayB.length);
    const result: [A, B][] = [];

    for (let i = 0; i < minLength; i++) {
        result.push([arrayA[i]!, arrayB[i]!]);
    }

    return result;
};

export const filterErrors = <T>(array: (T | CustomError)[]): T[] => {
    return array.filter(
        (element): element is Exclude<typeof element, CustomError> =>
            !(element instanceof CustomError),
    );
};
