import {
    SdsDeclaration,
    isSdsClass,
    isSdsFunction,
    isSdsPlaceholder,
} from "../../../generated/ast.js";
import { ClassDeclaration } from "./class.js";
import { Function } from "./function.js";
import { Placeholder } from "./placeholder.js";
import { Utils } from "../utils.js";

export class Declaration {
    public static readonly LOGGING_TAG: string =
        "CustomEditor] [AstParser] [Declaration";

    protected constructor(public readonly name: string) {}

    public static default(): Declaration {
        return new Declaration("unknown");
    }

    public static get(node: SdsDeclaration): Declaration | undefined {
        if (isSdsFunction(node)) {
            return Function.get(node);
        }

        if (isSdsPlaceholder(node)) {
            return Placeholder.get(node);
        }

        if (isSdsClass(node)) {
            return ClassDeclaration.get(node);
        }

        switch (node.$type) {
            // Abstract
            case "SdsClassMember":
            case "SdsModuleMember":
            case "SdsNamedTypeDeclaration":

            case "SdsAbstractResult":
            //    case "SdsResult":
            //    case "SdsBlockLambdaResult":

            case "SdsAnnotation":
            case "SdsAttribute":
            case "SdsEnum":
            case "SdsEnumVariant":
            case "SdsLocalVariable":
            case "SdsModule":
            case "SdsParameter":
            case "SdsPipeline":
            case "SdsSchema":
            case "SdsSegment":
            case "SdsTypeParameter":
                Utils.pushError(
                    Declaration.LOGGING_TAG,
                    `Unable to parse <${node.$type}>`,
                );
        }
        return;
    }
}
