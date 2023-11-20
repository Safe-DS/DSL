# Call Graph Testing

Call graph tests are data-driven instead of being specified explicitly. This document explains how to add a new call
graph test.

## Adding a call graph test

1. Create a new file with the extension `.sdstest` in the `tests/resources/call graph` directory or any subdirectory.
   Give the file a descriptive name, since the file name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the file name.

2. Add the Safe-DS code that you want to test to the file.
3. Surround calls or callables for which you want to compute a call graph with test markers, e.g. `»f()«`. Add a
   comment in the preceding line with the following format:
    ```ts
    // $TEST$ ["f", "$blockLambda", "$expressionLambda", "undefined"]
    ```
    The comment must contain an array with the names of the callables that are expected to be called. The order must
    match the actual call order. The names must be:
    * The quoted name of a named callable, e.g. `"f"`.
    * The string `"$blockLambda"` for a block lambda.
    * The string `"$expressionLambda"` for an expression lambda.
    * The string `"undefined"` for an undefined callable.
4. Run the tests. The test runner will automatically pick up the new test.
