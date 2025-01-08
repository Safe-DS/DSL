# Generation Testing

Safe-DS has two generation targets, [Python](#python-generation) (for execution) and [Markdown](#markdown-generation)
(for documentation). In either case, the generation tests are data-driven instead of being specified explicitly. This
document explains how to add a new generation test.

## Python Generation

### Adding a generation test

1. Create a new **folder** (not just a file!) in the `tests/resources/generation/python` directory or any subdirectory.
   Give the folder a descriptive name, since the folder name becomes part of the test name. By default, the runner
   integration is disabled. If you want to test the runner integration, place the folder in
   `tests/resources/generation/python/runner integration` or any subdirectory instead.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdsdev`, `.sds`, or `.sdsstub` **directly inside the folder**. All files in a
   folder will be loaded into the same workspace, so they can reference each other. Files in different folders are
   loaded into different workspaces, so they cannot reference each other. Generation will be triggered for all files in
   the folder.
3. Add the Safe-DS code that you want to test to the files.
4. If you want to run the program only up to a specific placeholder of a pipeline, surround **the name** of that
   placeholder with test markers, e.g. `val »a« = 1;`. You may only mark a single placeholder this way. Add a comment in
   the preceding line with the following format:
    ```ts
    // $TEST$ target
    ```
5. Run the tests. The test runner will automatically pick up the new test, and create a snapshot of the current output of the generator.
6. Verify that the snapshot is correct, modify it if needed, and commit it.

### Updating the snapshots

To quickly update the snapshots after changes to the code generator, run `vitest` with the `--update` flag.

## Markdown Generation

### Adding a generation test

1. Create a new **folder** (not just a file!) in the `tests/resources/generation/markdown` directory or any
   subdirectory. Give the folder a descriptive name, since the folder name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdsdev`, `.sds`, or `.sdsstub` **directly inside the folder**. All files in a
   folder will be loaded into the same workspace, so they can reference each other. Files in different folders are
   loaded into different workspaces, so they cannot reference each other. Generation will be triggered for all files in
   the folder.
3. Add the Safe-DS code that you want to test to the files.
4. Run the tests. The test runner will automatically pick up the new test, and create a snapshot of the current output of the generator.
5. Verify that the snapshot is correct, modify it if needed, and commit it.

### Updating the snapshots

To quickly update the snapshots after changes to the code generator, run `vitest` with the `--update` flag.
