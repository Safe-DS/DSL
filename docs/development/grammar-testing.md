# Grammar Testing

Grammar tests are data driven instead of being specified explicitly. This document explains how to add a new grammar test.

## Adding a grammar test

1. Create a new file with extension `.sdstest` in the `DSL-langium/tests/resources/grammar` directory or any
   subdirectory. Give the file a descriptive name, since the file name becomes part of the test name.

    !!! note "Naming convention"

        By convention, the names of files that **should not** contain syntax errors should be prefixed with `good-` and the names of files that **should** contain syntax errors with `bad-`. This is irrelevant for the test runner, but it helps to keep the tests organized.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the file name.

2. If you want to assert that a file is parsed without a syntax error[^1], add the following comment to the file:
    ```ts
    // $TEST$ no_syntax_error
    ```
   If you instead want to assert that the parser detects a syntax error, add the following comment to the file:
    ```ts
    // $TEST$ syntax_error
    ```

    !!! warning

        The two comments are mutually exclusive. You must have exactly one in a grammar test file.

    !!! note "Comment placement"

        By convention, the comment should be placed at the start of the file.

3. Add the Safe-DS code that you want to test to the file.
4. Run the tests. The test runner will automatically pick up the new test.

[^1]: We do not differentiate whether the error originated in the lexer (error code `lexing-error`) or the actual parser (error code `parsing-error`). Both are treated as syntax errors.
