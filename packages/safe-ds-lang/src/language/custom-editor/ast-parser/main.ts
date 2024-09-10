import { AstNode, LangiumDocument } from "langium";
import {
    isSdsPipeline,
    isSdsSegment,
    SdsModule,
    SdsStatement,
} from "../../generated/ast.js";
import { Statement } from "./statement.js";
import { Ast } from "../global.js";
import { Segment } from "./segment.js";
import { Utils } from "./utils.js";

export const parseDocument = (
    document: LangiumDocument<AstNode>,
): [Ast, Segment[]] => {
    const root = document.parseResult.value as SdsModule;
    const segments = root.members.filter((member) => isSdsSegment(member));
    const pipelines = root.members.filter((member) => isSdsPipeline(member));

    const segmentList: Segment[] = segments.map(Segment.parse);

    Utils.initialize();
    if (pipelines.length !== 1) {
        return [Utils.collectAst(), segmentList];
    }
    const block = pipelines[0]!.body;
    const statementList: SdsStatement[] = block.statements;
    statementList.forEach(Statement.parse);
    const ast = Utils.collectAst();

    return [ast, segmentList];
};
