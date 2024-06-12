import { SdsPlaceholder } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";

export class Placeholder extends Declaration {
    public static override LOGGING_TAG =
        "CustomEditor] [AstParser] [Placeholder";

    private constructor(name: string) {
        super(name);
    }

    public static override get(node: SdsPlaceholder): Placeholder {
        return new Placeholder(node.name);
    }
}
