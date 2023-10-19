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

    tokens = {
        'root': [
            (words(('pipeline', 'segment'), suffix=r'\b'), Name.Builtin),
            (r'//.+?$', Comment.Single),
            (r'/\*[\s\S]*?\*/', Comment.Multiline),
            (r'\s+', Whitespace),
        ],
    }
