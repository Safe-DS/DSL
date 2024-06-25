import { Error } from "../../../../../safe-ds-editor/types/error.js";
import { SafeDsMessagingProvider } from "../../communication/safe-ds-messaging-provider.js";
import { SafeDsAstType } from "../../generated/ast.js";
import { Call } from "./extractor/call.js";
import { Edge } from "./extractor/edge.js";
import { Placeholder } from "./extractor/placeholder.js";
import {
    GenericExpression,
    GenericExpressionNode,
} from "./parser/expression.js";

export type TypeMap = SafeDsAstType;

export class Utils {
    static logger: SafeDsMessagingProvider | undefined = undefined;
    static errorList: Error[] = [];
    static placeholderList: Placeholder[] = [];
    static callList: Call[] = [];
    static genericExpressionList: GenericExpressionNode[] = [];
    static edgeList: Edge[] = [];

    public static initialize(logger: SafeDsMessagingProvider) {
        Utils.logger = logger;
        Utils.errorList = [];
        Utils.placeholderList = [];
        Utils.callList = [];
        Utils.genericExpressionList = [];
        Utils.edgeList = [];
    }

    public static log(source: string[] | string, message: string) {
        const constructedSource: string = Array.isArray(source)
            ? source.reduce((result, tag) => `${result}] [${tag}`, "")
            : source;
        Utils.logger?.debug(constructedSource, message);
    }

    public static pushError(
        source: string[] | string,
        message: string,
        action: "block" | "notify" = "block",
    ) {
        const constructedSource: string = Array.isArray(source)
            ? source.join("] [")
            : source;
        Utils.errorList.push({
            action,
            source: `[${constructedSource}]`,
            message,
        });
        Utils.logger?.error(constructedSource, message);
    }

    public static getNewId = (() => {
        let lastNumber = 0;
        return () => lastNumber++;
    })();
}

export const zip = <A, B>(arrayA: A[], arrayB: B[]): [A, B][] => {
    const minLength = Math.min(arrayA.length, arrayB.length);
    const result: [A, B][] = [];

    for (let i = 0; i < minLength; i++) {
        result.push([arrayA[i]!, arrayB[i]!]);
    }

    return result;
};

export const displayCombo = (element: Call | GenericExpression): string => {
    return element instanceof Call
        ? `${element.name}()`
        : element.expression.toString();
};
