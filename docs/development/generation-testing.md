# Generation Testing

Generation tests are data-driven instead of being specified explicitly. This document explains how to add a new
generation test.

## Adding a generation test

1. If you do not want to test the runner integration (default), create a new **folder** (not just a file!) in the
   `tests/resources/generation/no runner integration` directory or any subdirectory. Otherwise, create a new folder
   the `tests/resources/generation/with runner integration` directory or any subdirectory. Give the folder a descriptive
   name, since the folder name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdstest`, `.sdspipe`, or `.sdsstub` **directly inside the folder**. All files in a
   folder will be loaded into the same workspace, so they can reference each other. Files in different folders are
   loaded into different workspaces, so they cannot reference each other. Generation will be triggered for all files in
   the folder.
3. Add the Safe-DS code that you want to test to the files.
4. If you want to run the program only up to a specific placeholder of a pipeline, surround **the name** of that
   placeholder with test markers, e.g. `val »a« = 1;`. You may only mark a single placeholder this way. Add a comment in
   the preceding line with the following format:
    ```ts
    // $TEST$ run_until
    ```
5. Add another folder called `output` inside the folder that you created in step 1. Place folders and Python files
   inside the `output` folder to specify the expected output of the program. The relative paths to the Python files and
   the contents of the Python files will be compared to the actual generation output.
6. Run the tests. The test runner will automatically pick up the new test.
