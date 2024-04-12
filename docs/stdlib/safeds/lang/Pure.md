# :test_tube:{ title="Experimental" } `#!sds annotation` Pure {#safeds.lang.Pure data-toc-label='Pure'}

Indicates that the function has no side effects and always returns the same results given the same arguments.

Calls to such a function may be eliminated, if its results are not used. Moreover, the function can be memoized, i.e.
we can remember its results for a set of arguments. Finally, a pure function can be called at any time, allowing
reordering of calls or parallelization.

**Targets:**

- `Function`

??? quote "Stub code in `purity.sdsstub`"

    ```sds linenums="12"
    annotation Pure
    ```
