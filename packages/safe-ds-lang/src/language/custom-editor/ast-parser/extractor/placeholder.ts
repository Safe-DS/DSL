import { SdsPlaceholder } from "../../../generated/ast.js";
import { Utils } from "../utils.js";

export class Placeholder {
    public static LOGGING_TAG = "CustomEditor] [AstParser] [Placeholder";

    private constructor(
        public readonly name: string,
        public readonly text?: string,
    ) {}

    public static get(node: SdsPlaceholder): Placeholder {
        const placeholder = new Placeholder(node.name, node.$cstNode?.text);
        Utils.placeholderList.push(placeholder);
        return placeholder;
    }
}
