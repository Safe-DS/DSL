import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SdsClass } from '../generated/ast.js';
import { stream, Stream } from 'langium';

export class SafeDsClassHierarchy {
    private readonly builtinClasses: SafeDsClasses;

    constructor(services: SafeDsServices) {
        this.builtinClasses = services.builtins.Classes;
    }

    superClasses(node: SdsClass): Stream<SdsClass> {
        const generator = function* () {
            const visited = new Set<SdsClass>();

            // let  current = node.parentClass;
        };

        return stream(generator());
        // val visited = mutableSetOf<SdsClass>()
        //
        // // TODO: multiple parent classes
        // var current = parentClassOrNull()
        // while (current != null && current !in visited) {
        //     yield(current)
        //     visited += current
        //     current = current.parentClassOrNull()
        // }
        //
        // val anyClass = this@superClasses.getStdlibClassOrNull(StdlibClasses.Any)
        // if (anyClass != null && this@superClasses != anyClass && visited.lastOrNull() != anyClass) {
        //     yield(anyClass)
        // }
    }

    private firstParentClassOrUndefined() {

    }
}
