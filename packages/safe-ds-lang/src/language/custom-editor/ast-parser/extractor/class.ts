import { SdsClass } from "../../../generated/ast.js";

export class ClassDeclaration {
    public static LOGGING_TAG = "CustomEditor] [AstParser] [Class";

    private constructor(
        public readonly name: string,
        public readonly text?: string,
    ) {}

    public static get(node: SdsClass): ClassDeclaration {
        return new ClassDeclaration(node.name, node.$cstNode?.text);
    }

    public toString(): string {
        return this.name;
    }
}
