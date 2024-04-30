# References

References are used to refer to a declaration, such as a [class][classes] or a [placeholder][placeholders]. The syntax is simply the name of the declaration, as shown in the next snippet where we first declare a [placeholder][placeholders] called `#!sds one` and then refer to it when computing the value for the [placeholder][placeholders] called `#!sds two`:

```sds
val one = 1;
val two = one + one;
```

In order to refer to global declarations in other [packages][packages], we first need to [import][imports] them.


[imports]: ../imports.md
[packages]: ../packages.md
[classes]: ../../stub-language/classes.md
[placeholders]: ../statements/assignments.md#declaring-placeholders
[segment-body]: ../segments.md#statements
