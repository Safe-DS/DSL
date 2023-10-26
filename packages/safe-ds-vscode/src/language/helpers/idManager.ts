/**
 * Handles the mapping of objects, usually nodes of a Safe-DS AST, to their IDs.
 */
export class IdManager<T extends WeakKey> {
    /**
     * Maps an object to an ID.
     */
    private objToId: WeakMap<T, Id> = new WeakMap();

    /**
     * The next available ID.
     */
    private nextId = 0;

    /**
     * Assigns the next available ID to the given object unless it already has one and returns the ID for this object.
     */
    assignId(obj: T): Id {
        if (!this.objToId.has(obj)) {
            this.objToId.set(obj, this.nextId++);
        }
        return this.objToId.get(obj)!;
    }

    /**
     * Removes all mappings between object and ID and resets the counter.
     */
    reset() {
        this.objToId = new WeakMap();
        this.nextId = 0;
    }
}

export type Id = number;
