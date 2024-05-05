# Type Casts

The compiler can _infer_ the [type][types] of an expression in almost all cases. However, sometimes its type must be
specified explicitly. This is called a _type cast_. Here is an example:

```sds
table.getColumn("age") as Column<Int>
```

A type cast is written as follows:

- The expression to cast.
- The keyword `#!sds as`.
- The type to cast to.

Afterward, the compiler will treat the expression as if it had the specified type. If the expression's actual type is
not compatible with the specified type, the compiler will raise an error.

!!! warning "Precedence"
    Type casts have the lowest precedence of all operators. If you want to use a type cast in an expression, you must
    enclose it in parentheses:

    ```sds
    (row.getValue("age") as Int) < 18
    ```

    This is necessary, because the less than operator (`<`) looks the same as the opening angle bracket of a type
    argument list (`Column<Int>`). We could remove this ambiguity by using different syntax for the less than operator
    or for type argument lists, but both are established conventions in other languages.

[types]: ../types.md
