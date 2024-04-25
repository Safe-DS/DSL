# Indexed Accesses

An indexed access is used to access elements of a list by index or values of a map by key. In the following example, we use an index access to retrieve the first element of the `#!sds values` list:

```sds
segment printFirst(values: List<Int>) {
    print(values[0]);
}
```

These are the elements of the syntax:

- An expression that evaluates to a list or map (here the [reference][references] `#!sds values`).
- An opening square bracket.
- The index, which is an expression that evaluates to an integer. The first element has index 0.
- A closing square bracket.

Note that accessing a value at an index outside the bounds of the value list currently only raises an error at runtime.

## Null-Safe Indexed Accesses

If an expression can be `#!sds null`, it cannot be used as the receiver of a regular indexed access. Instead, a null-safe indexed access must be used. A null-safe indexed access evaluates to `#!sds null` if its receiver is `#!sds null`. Otherwise, it works just like a normal indexed access. This is particularly useful for [chaining][chaining].

The syntax is identical to a normal indexed access except that we replace the `#!sds []` with `#!sds ?[]`:

```sds
nullableList?[0]
```


[references]: references.md
[chaining]: chaining.md
