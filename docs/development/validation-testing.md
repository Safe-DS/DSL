# Validation Testing

Validation tests are data-driven instead of being specified explicitly. This document explains how to add a new
validation test.

## Adding a validation test

1. Create a new **folder** (not just a file!) in the `tests/resources/validation` directory or any subdirectory. Give
   the folder a descriptive name, since the folder name becomes part of the test name.

    !!! tip "Skipping a test"

        If you want to skip a test, add the prefix `skip-` to the folder name.

2. Add files with the extension `.sdstest`, `.sdspipe`, or `.sdsstub` **directly inside the folder**. All files in a
   folder will be loaded into the same workspace, so they can reference each other. Files in different folders are
   loaded into different workspaces, so they cannot reference each other.
3. Add the Safe-DS code that you want to test to the files.
4. Specify the expected validation results using test comments (see [below](#format-of-test-comments)) and test
   markers (e.g. `fun »F«()`). The test comments are used to specify
    * the presence or absence of an issue,
    * the severity of the issue, and
    * the message of the issue.

    The test markers are used to specify the location of the issue. Test comments and test markers are mapped to each
    other by their position in the file, i.e. the first test comment corresponds to the first test marker, the second
    test comment corresponds to the second test marker, etc. There may be more test comments than test markers, but not
    the other way around. Any additional test comments are applied to the entire file.

5. Run the tests. The test runner will automatically pick up the new test.

## Format of test comments

1. As usual, test comments are single-line comments that start with `$TEST$`.
2. Then, you specify whether the issue should be absent by writing `no` or present by writing nothing.
3. Next, you specify the severity of the issue by writing `error`, `warning`, `info`, or `hint`.
4. Finally, you can optionally specify the message of the issue enclosed in double-quotes. You can also add an `r`
   before the opening double-quote to indicate that the expected message should be interpreted as a regular expression
   that must match the entire actual message.

Here are some examples:

```ts
// $TEST$ error "Incompatible type."
```

We expect an error with the exact message `Incompatible type.`.

```ts
// $TEST$ no warning "Name should be lowerCamelCase."
```

We expect no warning with the exact message `Name should be lowerCamelCase.`.

```ts
// $TEST$ info r".*empty.*"
```

We expect an info with a message that matches the regular expression `.*empty.*`.
