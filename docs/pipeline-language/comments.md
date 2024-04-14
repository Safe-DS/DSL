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

```sds hl_lines="1 2 3"
/**
 * This is a documentation comment.
 */
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
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
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
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
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
```

#### `@param`

Use `@param` to document a [parameter][parameter] of a [segment][segment]. This tag takes the name of the parameter
and its description as arguments. Since a segment can have multiple parameters, this tag can be used multiple times.

```sds  hl_lines="4 5"
/**
 * ...
 *
 * @param a The first summand.
 * @param b The second summand.
 */
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
```

#### `@result`

Use `@result` to document a [result][result] of a [segment][segment]. This tag takes the name of the result and its
description as arguments. Since a segment can have multiple results, this tag can be used multiple times.

```sds hl_lines="4"
/**
 * ...
 *
 * @result sum The sum of `a` and `b`.
 */
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
```

#### `@example`

Use `@example` to provide an example of how to use a declaration. This tag takes the example code as an argument.

```sds hl_lines="4 5 6 7"
/**
 * ...
 *
 * @example
 * pipeline main {
 *     val result = sum(1, 2);
 * }
 */
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
```

!!! warning "Limitation"

    The example code must not contain any blank lines. Otherwise, only the code up to the first blank line is
    considered.

#### `@since`

The `@since` tag can be used to specify when a declaration was added. It takes the version as argument and should be
used only once.

```sds hl_lines="4"
/**
 * ...
 *
 * @since 1.0.0
 */
segment sum(a: Int, b: Int) -> sum: Int {
    yield sum = a + b;
}
```

[^1]: Except [parameter][parameter] and [results][result], which are documented with the [`@param`](#param) and
      [`@result`](#result) tags on the containing declaration, respectively.


[segment]: segments.md
[parameter]: segments.md#parameters
[result]: segments.md#results
