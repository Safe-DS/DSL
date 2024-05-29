import { AstNode, LangiumDocument } from "langium";
import {
    SdsModule,
    SdsPipeline,
    SdsStatement,
} from "../../../generated/ast.js";
import { Utils } from "../utils.js";

import { parseStatement } from "./statement.js";

const LOGGING_TAG = "CustomEditor] [AstParser] [Document";

export const parseDocument = (document: LangiumDocument<AstNode>): void => {
    // Todo: properly use these errors
    document.parseResult.lexerErrors.forEach((error) => {
        Utils.log(
            [LOGGING_TAG, "LexerError"],
            `${error.line}: ${error.message}`,
        );
    });
    document.parseResult.parserErrors.forEach((error) => {
        Utils.log(
            [LOGGING_TAG, "ParserError"],
            `${error.name}: ${error.message}`,
        );
    });

    const root = document.parseResult.value as SdsModule;
    const block = (root.members[0] as SdsPipeline).body;
    const statementList: SdsStatement[] = block.statements;

    statementList.forEach(parseStatement);
};
