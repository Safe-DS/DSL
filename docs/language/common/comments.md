# Comments

Comments are mostly used to add explanations to the code for future readers - which can be yourself. They can also be used to "comment out" code that you want to keep but that should not be run right now, since comments are ignored by the compiler.

Safe-DS has two types of comments, namely _line comments_, which end at a linebreak, and _block comments_, which can cover multiple lines.

## Line Comments

Line comments stop at the end of a line:

```sds
// This is a comment.
```

As we can see here, they start with two slashes. There must be no space between the slashes. Everything after the double slashes in the same line is the text of the comment.

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

They are started with `/*` and end at the inverted delimiter `*/`. There must be no space between the slash and the star. Everything in between the delimiters is the text of the comment.
