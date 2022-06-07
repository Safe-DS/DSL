// package de.unibonn.simpleml.testing.assertions
//
// import de.unibonn.simpleml.prologBridge.model.facts.AnnotationCallT
// import de.unibonn.simpleml.prologBridge.model.facts.DeclarationT
// import de.unibonn.simpleml.prologBridge.model.facts.ExpressionT
// import de.unibonn.simpleml.prologBridge.model.facts.Node
// import de.unibonn.simpleml.prologBridge.model.facts.NodeWithParent
// import de.unibonn.simpleml.prologBridge.model.facts.PlFact
// import de.unibonn.simpleml.prologBridge.model.facts.PlFactbase
// import de.unibonn.simpleml.prologBridge.model.facts.ProtocolTermT
// import de.unibonn.simpleml.simpleML.SmlAbstractExpression
// import de.unibonn.simpleml.simpleML.SmlAbstractProtocolTerm
// import de.unibonn.simpleml.utils.Id
// import io.kotest.assertions.asClue
// import io.kotest.matchers.collections.shouldHaveSize
// import io.kotest.matchers.ints.shouldBeGreaterThan
// import io.kotest.matchers.nulls.shouldNotBeNull
// import io.kotest.matchers.shouldBe
// import org.eclipse.emf.ecore.EObject
//
// inline fun <reified T : PlFact> PlFactbase.findUniqueFactOrFail(filter: (T) -> Boolean = { true }): T {
//    shouldHaveUniqueFact(filter)
//    return findUniqueFact(filter)!!
// }
//
// inline fun <reified T : PlFact> PlFactbase.shouldHaveUniqueFact(filter: (T) -> Boolean) {
//    val candidates = findFacts(filter)
//    if (candidates.isEmpty()) {
//        throw AssertionError("Expected a unique matching fact of type ${T::class.simpleName} but found none.")
//    } else if (candidates.size > 1) {
//        throw AssertionError("Expected a unique matching fact but found ${candidates.size}: $candidates")
//    }
// }
//
// inline fun <reified T : NodeWithParent> PlFactbase.shouldBeChildOf(childId: Id<EObject>?, parent: Node) {
//    childId.shouldNotBeNull()
//
//    val child = findUniqueFactOrFail<T> { it.id == childId }
//    child.asClue {
//        child.id.value shouldBeGreaterThan parent.id.value
//        child.parent shouldBe parent.id
//    }
// }
//
// inline fun <reified T : NodeWithParent> PlFactbase.shouldBeNChildrenOf(
//    childIds: List<Id<EObject>>?,
//    parent: Node,
//    n: Int
// ) {
//    childIds.shouldNotBeNull()
//    childIds shouldHaveSize n
//    childIds.forEach {
//        shouldBeChildOf<T>(it, parent)
//    }
// }
//
// inline fun <reified T : ExpressionT> PlFactbase.shouldBeChildExpressionOf(
//    childId: Id<SmlAbstractExpression>?,
//    parent: Node
// ) {
//    childId.shouldNotBeNull()
//
//    val child = findUniqueFactOrFail<T> { it.id == childId }
//    val expectedEnclosing = when (parent) {
//        is ExpressionT -> parent.enclosing
//        else -> parent.id
//    }
//
//    child.asClue {
//        child.id.value shouldBeGreaterThan parent.id.value
//        child.parent shouldBe parent.id
//        child.enclosing shouldBe expectedEnclosing
//    }
// }
//
// inline fun <reified T : ExpressionT> PlFactbase.shouldBeNChildExpressionsOf(
//    childIds: List<Id<SmlAbstractExpression>>?,
//    parent: Node,
//    n: Int
// ) {
//    childIds.shouldNotBeNull()
//    childIds shouldHaveSize n
//    childIds.forEach {
//        shouldBeChildExpressionOf<T>(it, parent)
//    }
// }
//
// inline fun <reified T : ProtocolTermT> PlFactbase.shouldBeChildProtocolTermOf(
//    childId: Id<SmlAbstractProtocolTerm>?,
//    parent: Node
// ) {
//    childId.shouldNotBeNull()
//
//    val child = findUniqueFactOrFail<T> { it.id == childId }
//    val expectedEnclosing = when (parent) {
//        is ProtocolTermT -> parent.enclosing
//        else -> parent.id
//    }
//
//    child.asClue {
//        child.id.value shouldBeGreaterThan parent.id.value
//        child.parent shouldBe parent.id
//        child.enclosing shouldBe expectedEnclosing
//    }
// }
//
// inline fun <reified T : ProtocolTermT> PlFactbase.shouldBeNChildProtocolTermsOf(
//    childIds: List<Id<SmlAbstractProtocolTerm>>?,
//    parent: Node,
//    n: Int
// ) {
//    childIds.shouldNotBeNull()
//    childIds shouldHaveSize n
//    childIds.forEach {
//        shouldBeChildProtocolTermOf<T>(it, parent)
//    }
// }
//
// fun PlFactbase.shouldHaveNAnnotationCalls(
//    declaration: DeclarationT,
//    n: Int,
// ) {
//    val annotationUses = findFacts<AnnotationCallT> { it.parent == declaration.id }
//    annotationUses shouldHaveSize n
//    annotationUses.forEach { shouldBeChildOf<AnnotationCallT>(it.id, declaration) }
// }
