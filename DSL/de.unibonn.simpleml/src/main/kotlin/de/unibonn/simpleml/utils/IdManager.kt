package de.unibonn.simpleml.utils

import de.unibonn.simpleml.simpleML.SmlAbstractObject
import java.util.WeakHashMap

/**
 * The ID of an object.
 */
@JvmInline
@Suppress("unused")
value class Id<out T : Any>(val value: Int)

/**
 * Handles the mapping of objects, usually [SmlAbstractObject]s in the Simple-ML AST, to their IDs.
 */
class IdManager<UPPER : Any> {

    /**
     * Maps an object to an ID.
     */
    private val objToId = WeakHashMap<UPPER, Id<UPPER>>()

    /**
     * Maps an ID to an object.
     */
    private val idToObj = WeakHashMap<Id<UPPER>, UPPER>()

    /**
     * The next available ID.
     */
    private var nextId = 0

    /**
     * Assigns the next available ID to the given object unless it already has one and returns the ID for this object.
     */
    fun <T : UPPER> assignIdIfAbsent(obj: T): Id<T> {
        if (obj !in objToId) {
            val id = nextId<T>()
            objToId[obj] = id
            idToObj[id] = obj
        }

        // We only write to objToId here and can be sure the stored ID has the correct type
        @Suppress("UNCHECKED_CAST")
        return objToId[obj]!! as Id<T>
    }

    /**
     * Returns the next available ID.
     */
    private fun <T : Any> nextId() = Id<T>(nextId++)

    /**
     * Returns the object with the given ID or `null` if the ID was not assigned yet.
     */
    fun getObjectById(id: Id<*>) = idToObj[id]

    /**
     * Checks if the given object already has an ID.
     */
    fun knowsObject(obj: Any) = obj in objToId

    /**
     * Check if the given ID has already been assigned to some object.
     */
    fun knowsId(id: Id<*>) = id in idToObj

    /**
     * Removes all mappings between object and ID and resets the counter.
     */
    fun reset() {
        objToId.clear()
        idToObj.clear()
        nextId = 0
    }
}
