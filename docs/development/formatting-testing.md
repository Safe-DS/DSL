# Formatting Testing

Formatting tests are data-driven instead of being specified explicitly. This document explains how to add a new
formatting test.

## Adding a formatting test

1. Create a new file with extension `.sdstest` in the `tests/resources/formatting` directory or any
   subdirectory. Give the file a descriptive name, since the file name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the file name.

2. Add the original unformatted Safe-DS code to the top of the file. The code must be syntactically valid.
3. Add the following separator to the file:
    ```sds
    // -----------------------------------------------------------------------------
    ```
4. Add the expected formatted Safe-DS code to the file below the separator.
5. Run the tests. The test runner will automatically pick up the new test.
