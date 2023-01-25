# How to prepare a release

1. Bump the version of the DSL in [build.gradle.kts][main-build-gradle]:
    ```kts
    subprojects {
        // ...
        version = "1.0.0"
        // ...
    }
    ```
1. Bump the version of the VS Code extension in [package.json][vscode-package-json]:
    ```json5
    {
        // ...
        "version": "1.0.0",
        // ...
    }
    ```
1. Run this command to also update the associated `package-lock.json` file:
    ```sh
    cd DSL/com.larsreimann.safeds.vscode
    npm i
    ```
1. Bump the version of the standard library in [safe-ds/pyproject.toml][stdlib-pyproject-toml]:
    ```toml
    [tool.poetry]
    # ...
    version = "1.0.0"
    # ...
    ```
1. Bump the version of the runner in [safe-ds-runner/pyproject.toml][runner-pyproject-toml]:
    ```toml
    [tool.poetry]
    # ...
    version = "1.0.0"
    # ...
    ```
1. Commit the changes in a new branch.
1. Create a pull request.
1. Merge the pull request into main.
1. Create a release on GitHub.

[main-build-gradle]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/build.gradle.kts

[vscode-package-json]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/DSL/com.larsreimann.safeds.vscode/package.json

[stdlib-pyproject-toml]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/Runtime/safe-ds/pyproject.toml

[runner-pyproject-toml]: https://github.com/lars-reimann/Safe-DS/blob/main/DSL/Runtime/safe-ds-runner/pyproject.toml
