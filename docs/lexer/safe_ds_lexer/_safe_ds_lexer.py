from pygments.lexer import RegexLexer, words
from pygments.token import Comment, Keyword, Name, Number, Operator, String, Whitespace

keywords_constants = (
    "false",
    "null",
    "true",
)

keywords_class = (
    "class",
    "enum",
)

keywords_declaration = (
    "val",
)

keywords_function = (
    "fun",
    "pipeline",
    "segment",
)

keywords_namespace = (
    "from",
    "package",
)

keywords_generic = (
    "annotation",
    "as",
    "attr",
    "const",
    "import",
    "in",
    "internal",
    "literal",
    "out",
    "private",
    "schema",
    "static",
    "union",
    "where",
    "yield",
)

operators = (
    "and",
    "not",
    "or",
    "sub",
    "super",
)


identifier_regex = r"[_a-zA-Z][_a-zA-Z0-9]*|`[_a-zA-Z][_a-zA-Z0-9]*`"
qualified_name_regex = fr"{identifier_regex}(\.{identifier_regex})*"


class SafeDsLexer(RegexLexer):
    name = "safe-ds"
    aliases = [
        "Safe-DS",
        "safe-ds",
        "SafeDS",
        "safeds",
        "SDS",
        "sds",
    ]
    filenames = ["*.sdspipe", "*.sdsstub", "*.sdstest"]

    tokens = {
        "root": [
            # Literals
            (r"\b([0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\b", Number),
            (r'"|}}', String, "string"),

            # Keywords
            (words(keywords_constants, prefix=r"\b", suffix=r"\b"), Keyword.Constant),
            (words(keywords_declaration, prefix=r"\b", suffix=r"\b"), Keyword.Declaration, "constant"),
            (words(keywords_class, prefix=r"\b", suffix=r"\b"), Keyword, "class"),
            (words(keywords_function, prefix=r"\b", suffix=r"\b"), Keyword, "function"),
            (words(keywords_namespace, prefix=r"\b", suffix=r"\b"), Keyword.Namespace, "namespace"),
            (words(keywords_generic, prefix=r"\b", suffix=r"\b"), Keyword),

            # Operators
            (words(operators, prefix=r"\b", suffix=r"\b"), Operator.Word),

            # Identifiers
            (identifier_regex, Name),

            # Comments
            (r"//.+?$", Comment.Single),
            (r"/\*[\s\S]*?\*/", Comment.Multiline),

            # Whitespace
            (r"\s+", Whitespace),
        ],
        "class": [
            (identifier_regex, Name.Class, "#pop"),
        ],
        "constant": [
            (identifier_regex, Name.Constant, "#pop"),
        ],
        "function": [
            (identifier_regex, Name.Function, "#pop"),
        ],
        "namespace": [
            (qualified_name_regex, Name.Namespace, "#pop"),
        ],
        "string": [
            (r'([^"{]|\{(?!\{))+', String),
            (r'\{\{|"', String, "#pop"),
        ],
    }
