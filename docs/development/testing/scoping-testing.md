# Scoping Testing

Scoping tests are data-driven instead of being specified explicitly. This document explains how to add a new scoping
test.

## Adding a scoping test

1. Create a new **folder** (not just a file!) in the `tests/resources/scoping` directory or any
   subdirectory. Give the folder a descriptive name, since the folder name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdstest` **directly inside
   the folder**. All files in a folder will be loaded into the same workspace, so they can
   reference each other. Files in different folders are loaded into different workspaces, so they cannot reference each other.
3. Add the Safe-DS code that you want to test to the files.
4. Surround **the name** of any declaration that you want to reference with test markers, e.g. `class »C«`. Add a
   comment in the preceding line with the following format (replace `<id>` with some unique identifier):
    ```ts
    // $TEST$ target <id>
    ```
5. Surround references you want to test with test markers, e.g. `»C«()`. If you want to assert that the reference should be resolved,
   add a comment in the preceding line with the following format (replace `<target_id>` with the identifier you previously
   assigned to the referenced declaration):

    ```ts
    // $TEST$ references <target_id>
    ```
   If you instead want to assert that the reference is unresolved, add the following comment to the preceding line:
    ```ts
    // $TEST$ unresolved
    ```
6. Run the tests. The test runner will automatically pick up the new test.
