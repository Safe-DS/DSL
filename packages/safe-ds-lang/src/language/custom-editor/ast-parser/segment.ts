import { SdsSegment } from "../../generated/ast.js";
import { Ast } from "../global.js";
import { Parameter } from "./parameter.js";
import { Result } from "./result.js";
import { Statement } from "./statement.js";
import { filterErrors, Utils } from "./utils.js";

export const SegmentParameterId = -1;
export const SegmentYieldId = -2;

export class Segment {
    private constructor(
        public readonly name: string,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        public readonly ast: Ast,
        public readonly uniquePath: string,
    ) {}

    public static parse(node: SdsSegment): Segment {
        Utils.initialize();
        const name = node.name;
        const resultList = filterErrors(
            (node.resultList?.results ?? []).map(Result.parse),
        );
        const parameterList = filterErrors(
            (node.parameterList?.parameters ?? []).map(Parameter.parse),
        );

        node.body.statements.forEach(Statement.parse);

        const ast = Utils.collectAst();
        const segment = new Segment(
            name,
            parameterList,
            resultList,
            ast,
            Utils.safeDsServices.workspace.AstNodeLocator.getAstNodePath(node),
        );
        return segment;
    }
}
