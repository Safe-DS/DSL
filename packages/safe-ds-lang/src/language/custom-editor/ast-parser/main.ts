import { AstNode, LangiumDocument } from "langium";
import {
    isSdsPipeline,
    isSdsSegment,
    SdsModule,
    SdsStatement,
} from "../../generated/ast.js";
import { Statement } from "./statement.js";
import { Graph } from "../global.js";
import { Segment } from "./segment.js";
import { Utils } from "./utils.js";

export const parseDocument = (
    document: LangiumDocument<AstNode>,
): [Graph, Segment[]] => {
    const root = document.parseResult.value as SdsModule;
    const segments = root.members.filter((member) => isSdsSegment(member));
    const pipelines = root.members.filter((member) => isSdsPipeline(member));

    const segmentList: Segment[] = segments.map(Segment.parse);

    Utils.initialize();
    if (pipelines.length !== 1) {
        return [new Graph("pipeline", Utils.collectAst()), segmentList];
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

    return [graph, segmentList];
};
