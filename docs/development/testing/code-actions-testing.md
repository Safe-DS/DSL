# Code Actions Testing

Code actions tests are data-driven instead of being specified explicitly. This document explains how to add a new
code action test.

## Adding a code action test

1. Create a new **folder** (not just a file!) in the `tests/resources/code actions` directory or any subdirectory. Give
   the folder a descriptive name, since the folder name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdsdev`, `.sds`, or `.sdsstub` **directly inside the folder**. All files in a
   folder will be loaded into the same workspace, so they can reference each other. Files in different folders are
   loaded into different workspaces, so they cannot reference each other.
3. Add the Safe-DS code that you want to test to the files.
4. Specify the code actions to apply using test comments (see [below](#format-of-test-comments)) at the top of the file.
5. Run the tests. The test runner will automatically pick up the new test, and create a snapshot of the current output
   after applying the selected code actions.
6. Verify that the snapshot is correct, modify it if needed, and commit it.

## Format of test comments

1. As usual, test comments are single-line comments that start with `$TEST$`.
2. Then, the keyword `apply` follows.
3. Finally, you must specify the title of the code action enclosed in double-quotes. You can also add an `r` before the
   opening double-quote to indicate that the title should be interpreted as a regular expression that must match the
   entire actual title.

Here are some examples:

```ts
// $TEST$ apply "Remove statement."
```

We apply all code actions with the exact title `Remove statement.`.

```ts
// $TEST$ apply r"^Remove.*"
```

We apply all code actions with a title that starts with `Remove`.


## Updating the snapshots

To quickly update the snapshots after changes to the code generator, run `vitest` with the `--update` flag.
