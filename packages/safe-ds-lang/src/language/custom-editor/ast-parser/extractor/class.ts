import { SdsClass } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";

export class ClassDeclaration extends Declaration {
    public static override LOGGING_TAG = "CustomEditor] [AstParser] [Class";

    private constructor(name: string, text?: string) {
        super(name, text);
    }

    public static override get(node: SdsClass): ClassDeclaration {
        return new ClassDeclaration(node.name, node.$cstNode?.text);
    }
}
