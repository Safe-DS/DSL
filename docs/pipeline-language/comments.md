# Comments

Comments are mostly used to add explanations to the code for future readers — which is often yourself. They can also be
used to "comment out" code that you want to keep but that should not be run right now, since comments are ignored by the
compiler.

Safe-DS has three types of comments, namely

* [_line comments_](#line-comments), which end at a linebreak,
* [_block comments_](#block-comments), which can cover multiple lines, and
* [_documentation comments_](#documentation-comments), which are used to specify the documentation for declarations.

## Line Comments

Line comments stop at the end of a line:

```sds
// This is a comment.
```

They start with `#!sds //`. There must be no space between the slashes. Everything after the double slashes in the same
line is the text of the comment.

To use line comments to "comment out" code you edit in VS Code, select the code and press ++ctrl+slash++ on your
keyboard. This will add `#!sds //` to the beginning of each selected line. You can also trigger this functionality by
using the `Toggle Line Comment` command in the command palette. To remove the line comments, select the commented code
and press ++ctrl+slash++ again.

## Block Comments

Block comments have a start and end delimiter, which allows them to cover multiple lines:

```sds
/*
This
is
another
comment
*/
```

They start with `#!sds /*` and end at the inverted delimiter `#!sds */`. There must be no space between the slash
and the star. Block comments cannot be nested. Everything in between the delimiters is the text of the comment.

To use block comments to "comment out" code you edit in VS Code, select the code and press ++ctrl+shift+slash++ on your
keyboard. This will surround the selected code with `#!sds /*` and `#!sds */`. You can also trigger this functionality
by using the `Toggle Block Comment` command in the command palette. To remove the block comment, select the commented
code and press ++ctrl+shift+slash++ again.

## Documentation Comments

Documentation comments are special [block comments](#block-comments) that are used to document declarations[^1]. The
documentation is used in various places, e.g. when hovering over a declaration or one of its usage in VS Code. Here is
an example:

```sds
/**
 * This is a documentation comment.
 */
class C
```

They start with `#!sds /**` and end with `#!sds */`. There must be no spaces inside the delimiters. Documentation
comments cannot be nested. Everything in between the delimiters is the text of the comment, except an optional leading
asterisk in each line, which is ignored. Documentation comments are attached to the declaration that follows them. If
there is no declaration following the documentation comment, it is treated as a normal [block comment](#block-comments),
with no special meaning.

### Markdown

Documentation comments support [Markdown](https://www.markdownguide.org/) to format the text. Here is an example:

```sds hl_lines="2"
/**
 * This is a documentation comment with **bold** and *italic* text.
 */
class C
```

### Tags

Documentation comments can contain tags to provide structured information.

#### `{@link}`

`{@link}` is an **inline** tag that can be used to link to another declaration. It takes the name of the declaration as
an argument:

```sds hl_lines="2"
/**
 * Computes the sum of two {@link Int}s.
 */
fun sum(a: Int, b: Int): sum: Int
```

To point to a member of a [class][class] or an [enum variant][enum-variant] of an [enum][enum], write the name of the
containing declaration followed by a dot and the name of the member or enum variant:

```sds hl_lines="2"
/**
 * To create a Configuration, use {@link Configuration.fromFile}.
 */
class Configuration {

    /**
     * Creates a Configuration from a file.
     */
    fun fromFile(file: String) -> result: Configuration
}
```

#### `@param`

Use `@param` to document a [parameter][parameter] of a callable declaration. This tag takes the name of the parameter
and its description as arguments. Since a callable can have multiple parameters, this tag can be used multiple times.

```sds  hl_lines="4 5"
/**
 * ...
 *
 * @param a The first integer.
 * @param b The second integer.
 */
fun sum(a: Int, b: Int): sum: Int
```

#### `@result`

Use `@result` to document a [result][result] of a callable declaration. This tag takes the name of the result and its
description as arguments. Since a callable can have multiple results, this tag can be used multiple times.

```sds hl_lines="4"
/**
 * ...
 *
 * @result sum The sum of `a` and `b`.
 */
fun sum(a: Int, b: Int): sum: Int
```

#### `@typeParam`

Use `@typeParam` to document a [type parameter][type-parameter] of a generic declaration. This tag takes the name of the
type parameter and its description as arguments. Since a generic declaration can have multiple type parameters, this
tag can be used multiple times.

```sds hl_lines="4"
/**
 * ...
 *
 * @typeParam T The type of the elements in the list.
 */
class List<T>
```

#### `@since`

The `@since` tag can be used to specify when a declaration was added. It takes the version as argument and should be
used only once.

```sds hl_lines="4"
/**
 * ...
 *
 * @since 1.0.0
 */
fun sum(a: Int, b: Int): sum: Int
```

[^1]: Except [parameter][parameter], [results][result], and [type parameters][type-parameter], which are documented with
the [`@param`](#param), [`@result`](#result), and [`@typeParam`](#typeparam) tags on the containing declaration,
respectively.

[class]: ../stub-language/classes.md
[enum]: ../stub-language/enumerations.md
[enum-variant]: ../stub-language/enumerations.md#enum-variants
[parameter]: parameters.md
[result]: segments.md#results
[type-parameter]: ../stub-language/type-parameters.md
