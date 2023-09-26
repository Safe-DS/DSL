# Typing Testing

Typing tests are data-driven instead of being specified explicitly. This document explains how to add a new typing
test.

## Adding a typing test

1. Create a new **folder** (not just a file!) in the `tests/resources/typing` directory or any subdirectory. Give the
   folder a descriptive name, since the folder name becomes part of the test name.

   !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdstest` **directly inside the folder**. All files in a folder will be loaded into the
   same workspace, so they can reference each other. Files in different folders are loaded into different workspaces, so
   they cannot reference each other.
3. Add the Safe-DS code that you want to test to the file.
4. Surround entire nodes whose type you want to check with test markers, e.g. `1 + 2`. For declarations, it is also
   possible to surround only their name, e.g. `class »C«`.
5. For each pair of test markers, add a test comment with one of the formats listed below. Test comments and test
   markers are mapped to each other by their position in the file, i.e. the first test comment corresponds to the first
   test marker, the second test comment corresponds to the second test marker, etc.
    * `// $TEST$ equivalence_class <id>`: Assert that all nodes with the same `<id>` have the same type. All equivalence
      classes must have at least two entries.
    * `// $TEST$ serialization <type>`: Assert that the serialized type of the node is `<type>`.
6. Run the tests. The test runner will automatically pick up the new test.
