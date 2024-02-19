from pygments.lexer import RegexLexer, words
from pygments.token import Comment, Keyword, Name, Number, Operator, String, Whitespace

keywords_annotation = ("annotation",)

keywords_class = (
    "class",
    "enum",
)

keywords_constant = (
    "attr",
    "val",
)

keywords_function = (
    "fun",
    "pipeline",
    "segment",
)

keywords_literal = (
    "false",
    "null",
    "true",
)

keywords_namespace = (
    "from",
    "package",
)

keywords_generic = (
    "as",
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
)

builtins = (
    "Any",
    "Nothing",
    "Boolean",
    "Number",
    "Int",
    "Float",
    "List",
    "Map",
    "String",
)

identifier_fragment = r"[_a-zA-Z][_a-zA-Z0-9]*"
identifier_regex = rf"{identifier_fragment}|`{identifier_fragment}`"
qualified_name_regex = rf"({identifier_regex})(\.({identifier_regex}))*"


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
            (
                words(keywords_annotation, prefix=r"\b", suffix=r"\b"),
                Keyword,
                "annotation",
            ),
            (words(keywords_class, prefix=r"\b", suffix=r"\b"), Keyword, "class"),
            (
                words(keywords_constant, prefix=r"\b", suffix=r"\b"),
                Keyword.Declaration,
                "placeholder",
            ),
            (words(keywords_function, prefix=r"\b", suffix=r"\b"), Keyword, "function"),
            (words(keywords_literal, prefix=r"\b", suffix=r"\b"), Keyword.Constant),
            (
                words(keywords_namespace, prefix=r"\b", suffix=r"\b"),
                Keyword.Namespace,
                "namespace",
            ),
            (words(keywords_generic, prefix=r"\b", suffix=r"\b"), Keyword),
            # Operators
            (words(operators, prefix=r"\b", suffix=r"\b"), Operator.Word),
            # Builtins
            (words(builtins, prefix=r"\b", suffix=r"\b"), Name.Builtin),
            # Identifiers
            (rf"@{identifier_regex}", Name.Decorator),
            (identifier_regex, Name),
            # Comments
            (r"//.+?$", Comment.Single),
            (r"/\*[\s\S]*?\*/", Comment.Multiline),
            # Whitespace
            (r"\s+", Whitespace),
        ],
        "annotation": [
            (identifier_regex, Name.Decorator, "#pop"),
        ],
        "class": [
            (identifier_regex, Name.Class, "#pop"),
        ],
        "function": [
            (identifier_regex, Name.Function, "#pop"),
        ],
        "namespace": [
            (qualified_name_regex, Name.Namespace, "#pop"),
        ],
        "placeholder": [
            (identifier_regex, Name.Constant, "#pop"),
        ],
        "string": [
            (r'([^"{]|\{(?!\{))+', String),
            (r'\{\{|"', String, "#pop"),
        ],
    }
