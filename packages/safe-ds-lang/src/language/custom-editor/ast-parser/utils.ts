import { AstNode, Reference } from "langium";
import { Error } from "../../../../../safe-ds-editor/types/error.js";
import { SafeDsMessagingProvider } from "../../communication/safe-ds-messaging-provider.js";
import { SafeDsAstType } from "../../generated/ast.js";
import { Call } from "./extractor/call.js";
import { Edge } from "./extractor/edge.js";

export type TypeMap = SafeDsAstType;

export class Utils {
    static logger: SafeDsMessagingProvider | undefined = undefined;
    static errorList: Error[] = [];
    static callList: Call[] = [];
    static edgeList: Edge[] = [];

    public static initialize(logger: SafeDsMessagingProvider) {
        Utils.logger = logger;
        Utils.errorList = [];
        Utils.callList = [];
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

    public static assertType<T extends AstNode>(obj: AstNode): obj is T {
        /* This is used to "inform" the typesystem that this node has the correct type */
        /* This is valid, because the node type ALWAYS corresponds to the .$type attribute */
        return true;
    }

    public static isDefined<T extends AstNode | Reference, K extends keyof T>(
        node: T,
        member: K,
        source: string,
        message?: string,
    ): node is T & Record<K, Exclude<T[K], undefined>> {
        const result = node[member] !== undefined;
        const nodeType = "$type" in node ? node.$type : "Reference";
        if (!result) {
            if (message) {
                Utils.pushError(source, message);
            } else {
                Utils.pushError(
                    source,
                    `${nodeType}: Undefined attribute <${String(member)}>`,
                );
            }
        }
        return result;
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
