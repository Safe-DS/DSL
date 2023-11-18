import { SdsCallable } from '../generated/ast.js';
import { stream, Stream } from 'langium';

export class CallGraph {
    constructor(
        readonly root: SdsCallable,
        readonly children: CallGraph[],
    ) {}

    /**
     * Traverses the call graph depth-first in pre-order and returns a stream of all callables that are called directly
     * or indirectly.
     */
    streamCalledCallables(): Stream<SdsCallable> {
        return stream(this.streamCalledCallablesGenerator());
    }

    private *streamCalledCallablesGenerator(): Generator<SdsCallable, void> {
        yield this.root;

        for (const child of this.children) {
            yield* child.streamCalledCallablesGenerator();
        }
    }
}
