// package de.unibonn.simpleml.prologBridge.model.facts
//
// import de.unibonn.simpleml.utils.Id
//
// private const val factPrefix = "simpleml"
//
// class PlFactbase {
//    val facts = mutableListOf<PlFact>()
//
//    inline fun <reified T : Node> Id<*>.resolve(): T? {
//        return findUniqueFact<T> { it.id == this }
//    }
//
//    inline fun <reified T> findUniqueFact(filter: (T) -> Boolean = { true }): T? {
//        val candidates = findFacts(filter)
//        return when (candidates.size) {
//            1 -> candidates.first()
//            else -> null
//        }
//    }
//
//    inline fun <reified T> findFacts(filter: (T) -> Boolean = { true }): List<T> {
//        return facts.filterIsInstance<T>().filter(filter)
//    }
//
//    fun isContainedIn(descendant: Node, ancestor: Node): Boolean {
//        return isContainedIn(descendant, ancestor, mutableSetOf())
//    }
//
//    private tailrec fun isContainedIn(descendant: Node, ancestor: Node, visitedNodes: MutableSet<Node>): Boolean {
//        return when (descendant) {
//            ancestor -> true
//            !is NodeWithParent -> false
//            in visitedNodes -> false
//            else -> {
//                val parent = descendant.parent.resolve<Node>()
//                if (parent == null) {
//                    false
//                } else {
//                    visitedNodes += descendant
//                    isContainedIn(parent, ancestor, visitedNodes)
//                }
//            }
//        }
//    }
//
//    /**
//     * Add this fact to the factbase.
//     */
//    operator fun PlFact.unaryPlus() {
//        facts += this
//    }
//
//    override fun toString() = buildString {
//        appendDiscontiguousDirectives()
//        appendNodes()
//        appendOtherFacts()
//        appendPefCounts()
//    }
//
//    private fun StringBuilder.appendDiscontiguousDirectives() {
//        facts.map { it.functor }
//            .toSortedSet()
//            .forEach { appendLine(":- discontiguous($factPrefix:$it).") }
//    }
//
//    private fun StringBuilder.appendNodes() {
//        facts.filterIsInstance<Node>()
//            .sortedBy { it.id.value }
//            .forEach { appendLine("$factPrefix:$it") }
//    }
//
//    private fun StringBuilder.appendOtherFacts() {
//        facts.filter { it !is Node }
//            .sortedBy { it.functor }
//            .forEach { appendLine("$factPrefix:$it") }
//    }
//
//    private fun StringBuilder.appendPefCounts() {
//        facts.groupBy { it.functor }
//            .toSortedMap()
//            .forEach { appendLine("$factPrefix:pefCount(${it.key}, ${it.value.size}).") }
//    }
// }
