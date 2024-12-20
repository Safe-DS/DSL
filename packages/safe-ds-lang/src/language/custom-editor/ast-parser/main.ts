import { AstNode, LangiumDocument } from "langium";
import {
    isSdsPipeline,
    isSdsSegment,
    SdsModule,
    SdsStatement,
} from "../../generated/ast.js";
import { Statement } from "./statement.js";
import { CustomError, Graph } from "../global.js";
import { Segment } from "./segment.js";
import { Utils } from "./utils.js";
import { documentToJson, saveJson } from "./tools/debug-utils.js";

export const parseDocument = (
    document: LangiumDocument<AstNode>,
): [Graph, CustomError[], Segment[]] => {
    Utils.initialize();

    document.parseResult.lexerErrors.forEach(Utils.pushLexerErrors);
    document.parseResult.parserErrors.forEach(Utils.pushParserErrors);
    if (Utils.errorList.length > 0) {
        return [new Graph("pipeline", Utils.collectAst()), Utils.errorList, []];
    }

    saveJson(documentToJson(document, 16), "currentDocument");

    const root = document.parseResult.value as SdsModule;
    const segments = root.members.filter((member) => isSdsSegment(member));
    const pipelines = root.members.filter((member) => isSdsPipeline(member));

    const segmentList: Segment[] = segments.map(Segment.parse);

    Utils.initialize();
    if (pipelines.length !== 1) {
        return [
            new Graph("pipeline", Utils.collectAst()),
            Utils.errorList,
            segmentList,
        ];
    }
    const block = pipelines[0]!.body;
    const statementList: SdsStatement[] = block.statements;
    statementList.forEach(Statement.parse);

    const graph: Graph = new Graph(
        "pipeline",
        Utils.collectAst(),
        Utils.safeDsServices.workspace.AstNodeLocator.getAstNodePath(
            pipelines[0]!,
        ),
        pipelines[0]!.name,
    );

    return [graph, Utils.errorList, segmentList];
};
