import { SdsPlaceholder } from "../../generated/ast.js";
import { Datatype } from "./type.js";
import { Utils } from "./utils.js";

export class Placeholder {
    private constructor(
        public readonly name: string,
        public type: Datatype,
    ) {}

    public static parse(node: SdsPlaceholder) {
        const placeholder = new Placeholder(node.name, "Unknown");
        Utils.placeholderList.push(placeholder);
        return placeholder;
    }
}
