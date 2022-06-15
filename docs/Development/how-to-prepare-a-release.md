# How to prepare a release

1. Bump the version of the DSL in [build.gradle.kts][main-build-gradle]:
    ```kts
    subprojects {
        // ...
        version = "1.0.0"
        // ...
    }
    ```

2. Bump the version of the VS Code extension in [package.json][vscode-package-json]:
    ```json5
    {
        // ...
        "version": "1.0.0",
        // ...
    }
    ```
3. Run this command to also update the associated `package-lock.json` file:
    ```sh
    cd DSL/com.larsreimann.safeds.vscode
    npm i
    ```
4. Bump the version of the standard library in [safe-ds/pyproject.toml][stdlib-pyproject-toml]:
    ```toml
    [tool.poetry]
    # ...
    version = "1.0.0"
    # ...
    ```
5. Bump the version of the runner in [safe-ds-runner/pyproject.toml][runner-pyproject-toml]:
    ```toml
    [tool.poetry]
    # ...
    version = "1.0.0"
    # ...
    ```
6. Commit the changes in a new branch.
7. Create a pull request.
8. Merge the pull request into main.
9. Create a release on GitHub.

[main-build-gradle]: ../../DSL/build.gradle.kts

[vscode-package-json]: ../../DSL/com.larsreimann.safeds.vscode/package.json

[stdlib-pyproject-toml]: ../../Runtime/safe-ds/pyproject.toml

[runner-pyproject-toml]: ../../Runtime/safe-ds-runner/pyproject.toml
