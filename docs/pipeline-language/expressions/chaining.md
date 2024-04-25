## Chaining

Multiple [calls][calls], [member accesses][member-accesses], and [indexed accesses][indexed-accesses] can be chained together. Let us first look at the declaration of the [class][classes] we need for the example:

```sds
class LinearRegression() {
    fun drawAsGraph()
}
```

This is a [class][classes] `#!sds LinearRegression`, which has a constructor and an instance [method][methods] called `#!sds drawAsGraph`.

We can then use those declarations in a [segment][segments]:

```sds
segment mySegment(regressions: List<LinearRegression>) {
    regressions[0].drawAsGraph();
}
```

This segment is called `#!sds mySegment` and has a [parameter][parameters] `#!sds regressions` of type `#!sds List<LinearRegression>`.

In the body of the segment we then

1. access the first instance in the list using an [indexed access][indexed-accesses],
2. access the instance method `#!sds drawAsGraph` of this instance using a [member access][member-accesses],
3. [call][calls] this method.


[parameters]: ../segments.md#parameters
[classes]: ../../stub-language/classes.md
[methods]: ../../stub-language/classes.md#defining-methods
[segments]: ../segments.md
[member-accesses]: member-accesses.md
[calls]: calls.md
[indexed-accesses]: indexed-accesses.md
