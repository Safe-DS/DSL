import { AstNode, LangiumDocument } from "langium";
import { SdsModule, SdsPipeline, SdsStatement } from "../../generated/ast.js";
import { Statement } from "./statement.js";

export const parseDocumentNew = (document: LangiumDocument<AstNode>): void => {
    const root = document.parseResult.value as SdsModule;
    const block = (root.members[0] as SdsPipeline).body;
    const statementList: SdsStatement[] = block.statements;

    statementList.forEach(Statement.parse);
};
