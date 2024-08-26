import { SdsPlaceholder } from "../../generated/ast.js";
import { Datatype } from "./type.js";
import { Utils } from "./utils.js";

export class Placeholder {
    private constructor(
        public readonly name: string,
        public type: Datatype,
        public readonly uniquePath: string,
    ) {}

    public static parse(node: SdsPlaceholder) {
        const match = Utils.placeholderList.find(
            (placeholder) => placeholder.name === node.name,
        );
        if (match) return match;

        const placeholder = new Placeholder(
            node.name,
            "Unknown",
            Utils.safeDsServices.workspace.AstNodeLocator.getAstNodePath(node),
        );
        Utils.placeholderList.push(placeholder);
        return placeholder;
    }
}
