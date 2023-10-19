"""Pygments lexer for Safe-DS markup."""

from pygments.lexer import RegexLexer, words
from pygments.token import *


class SafeDsLexer(RegexLexer):
    name = 'safe-ds'
    aliases = [
        'Safe-DS',
        'safe-ds',
        'SafeDS',
        'safeds',
        'SDS',
        'sds'
    ]
    filenames = ['*.sdspipe', '*.sdsstub', '*.sdstest']

    constants = (
        'false',
        'null',
        'true'
    )

    keywords = (
        'annotation',
        'as',
        'attr',
        'class',
        'const',
        'enum',
        'fun',
        'in',
        'internal',
        'literal',
        'out',
        'pipeline',
        'private',
        'schema',
        'segment',
        'static',
        'union',
        'val',
        'where',
        'yield',
    )

    namespace = (
        'from',
        'import',
        'package',
    )

    operators = (
        'and',
        'not',
        'or',
        'sub',
        'super'
    )

    tokens = {
        'root': [
            (r'\b([0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\b', Number),
            (r'"|}}', String, 'string'),
            (words(constants, prefix=r'\b', suffix=r'\b'), Keyword.Constant),
            (words(keywords, prefix=r'\b', suffix=r'\b'), Keyword),
            (words(namespace, prefix=r'\b', suffix=r'\b'), Keyword.Namespace),
            (words(operators, prefix=r'\b', suffix=r'\b'), Operator.Word),
            (r'`[_a-zA-Z][_a-zA-Z0-9]*`', Name),
            (r'//.+?$', Comment.Single),
            (r'/\*[\s\S]*?\*/', Comment.Multiline),
            (r'\s+', Whitespace),
        ],
        'string': [
            (r'([^"{]|\{(?!\{))+', String),
            (r'\{\{|"', String, '#pop'),
        ],
    }
