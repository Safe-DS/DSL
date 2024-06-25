import { SdsPlaceholder } from "../../../generated/ast.js";
import { Utils } from "../utils.js";
import { Declaration } from "./declaration.js";

export class Placeholder extends Declaration {
    public static override LOGGING_TAG =
        "CustomEditor] [AstParser] [Placeholder";

    private constructor(name: string, text?: string) {
        super(name, text);
    }

    public static override get(node: SdsPlaceholder): Placeholder {
        const placeholder = new Placeholder(node.name, node.$cstNode?.text);
        Utils.placeholderList.push(placeholder);
        return placeholder;
    }
}
