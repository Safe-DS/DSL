import { Segment } from './ast-parser/segment.js';
import { Graph, CustomError } from './types.js';

export { SegmentGroupId } from './ast-parser/segment.js';
export { Segment } from './ast-parser/segment.js';
export { Placeholder } from './ast-parser/placeholder.js';
export { Call } from './ast-parser/call.js';
export { GenericExpression } from './ast-parser/expression.js';
export { Edge } from './ast-parser/edge.js';
export { Parameter } from './ast-parser/parameter.js';
export { Result } from './ast-parser/result.js';
export { Graph, Buildin, CustomError } from './types.js';

export interface Collection {
    pipeline: Graph;
    segmentList: Segment[];
    errorList: CustomError[];
}
