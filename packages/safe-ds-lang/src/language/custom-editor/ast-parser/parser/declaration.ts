import {
    SdsDeclaration,
    isSdsClass,
    isSdsFunction,
    isSdsPlaceholder,
} from "../../../generated/ast.js";
import { ClassDeclaration } from "../extractor/class.js";
import { FunctionDeclaration } from "../extractor/function.js";
import { Placeholder } from "../extractor/placeholder.js";
import { Utils } from "../utils.js";

const LOGGING_TAG: string = "CustomEditor] [AstParser] [Declaration";

export type DeclarationType =
    | FunctionDeclaration
    | Placeholder
    | ClassDeclaration;

export const Declaration = {
    get(node: SdsDeclaration): DeclarationType | undefined {
        if (isSdsFunction(node)) {
            return FunctionDeclaration.get(node);
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
                Utils.pushError(LOGGING_TAG, `Unable to parse <${node.$type}>`);
        }
        return;
    },
    default(): DeclarationType {
        return FunctionDeclaration.default();
    },
};
