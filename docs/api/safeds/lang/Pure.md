[//]: # (DO NOT EDIT THIS FILE DIRECTLY. Instead, edit the corresponding stub file and execute `npm run docs:api`.)

# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-annotation"></code> `Pure` {#safeds.lang.Pure data-toc-label='[annotation] Pure'}

The function has no side effects and always returns the same results given the same arguments.

Calls to such a function may be eliminated, if its results are not used. Moreover, the function can be memoized, i.e.
we can remember its results for a set of arguments. Finally, a pure function can be called at any time, allowing
reordering of calls or parallelization.

**Targets:**

- `Function`

??? quote "Stub code in `purity.sdsstub`"

    ```sds linenums="10"
    @Experimental
    @Targets([AnnotationTarget.Function])
    annotation Pure
    ```
    { data-search-exclude }
