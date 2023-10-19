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

    keywords = (
        'and',
        'annotation',
        'as',
        'attr',
        'class',
        'const',
        'enum',
        'false',
        'from',
        'fun',
        'import',
        'in',
        'internal',
        'literal',
        'not',
        'null',
        'or',
        'out',
        'package',
        'pipeline',
        'private',
        'schema',
        'segment',
        'static',
        'sub',
        'super',
        'true',
        'union',
        'val',
        'where',
        'yield',
    )

    tokens = {
        'root': [
            (words(keywords, suffix=r'\b'), Name.Builtin),
            (r'[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?', Number),
            (r'//.+?$', Comment.Single),
            (r'/\*[\s\S]*?\*/', Comment.Multiline),
            (r'\s+', Whitespace),
        ],
    }
