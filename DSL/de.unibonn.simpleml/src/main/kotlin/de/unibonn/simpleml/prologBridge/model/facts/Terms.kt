// package de.unibonn.simpleml.prologBridge.model.facts
//
// import de.unibonn.simpleml.utils.Id
// import java.text.NumberFormat
// import java.text.ParseException
//
// sealed class PlTerm {
//    companion object {
//
//        @JvmStatic
//        fun fromJavaRepresentation(javaRepresentation: List<Any?>): List<PlTerm> {
//            return javaRepresentation.map {
//                when (it) {
//                    null -> PlNull
//                    is Boolean -> PlBooleanAtom(it)
//                    is Id<*> -> PlNumber(it.value)
//                    is Number -> PlNumber(it)
//                    is String -> PlString(it)
//                    is List<*> -> PlList(fromJavaRepresentation(it))
//                    else -> throw IllegalArgumentException("Cannot handle type " + it.javaClass.typeName + ".")
//                }
//            }
//        }
//
//        @JvmStatic
//        fun fromString(s: String): List<PlTerm> {
//            return s.split(", (?![^\\[]*[\\]])".toRegex()).map {
//                if (it == "null") {
//                    PlNull
//                } else if (it == "true" || it == "false") {
//                    PlBooleanAtom(it)
//                } else if (it.matches(Regex("[0-9\\.]+"))) {
//                    PlNumber(it)
//                } else if (it.matches(Regex("\\'(.*?)\\'"))) {
//                    PlString(it.substring(1, it.length - 1))
//                } else if (it.matches(Regex("\\[(.*?)\\]"))) {
//                    PlList(fromString(it.substring(1, it.length - 1)))
//                } else {
//                    throw IllegalArgumentException("Cannot handle string format $it. ")
//                }
//            }
//        }
//    }
// }
//
// open class PlAtom(val value: String) : PlTerm() {
//    override fun toString() = value
// }
//
// object PlNull : PlAtom("null") {
//    override fun toString() = "null"
// }
//
// class PlBooleanAtom : PlTerm {
//    val value: Boolean
//
//    constructor(b: Boolean) {
//        value = b
//    }
//
//    constructor(s: String) {
//        value = (s == "true")
//    }
//
//    override fun toString() = value.toString()
// }
//
// class PlNumber : PlTerm {
//    var value: Number = 0
//
//    constructor(x: Number) {
//        value = x
//    }
//
//    constructor(s: String?) {
//        try {
//            value = NumberFormat.getInstance().parse(s)
//        } catch (e: ParseException) {
//            // TODO Auto-generated catch block
//            e.printStackTrace()
//        }
//    }
//
//    override fun toString(): String {
//        return value.toString()
//    }
// }
//
// class PlString(private val value: String) : PlTerm() {
//    fun toRawString() = value
//    override fun toString() = "'$value'" // TODO: this is an atom and not a string! a string has ""
// }
//
// /**
// * A data structure that represents a Prolog list.
// *
// * @param arguments The arguments of the list.
// */
// data class PlList(val arguments: List<PlTerm>) : PlTerm() {
//    override fun toString() = arguments.joinToString(prefix = "[", postfix = "]") { it.toString() }
// }
//
// // TODO:
// //  there are three different ways to create a PlList or PlFact:
// //   * parsed from string
// //   * create from basic java types like list/string
// //   * created with a list of PlArguments
// //   we should have common default case and always offer the same set of options
