# <code class="doc-symbol doc-symbol-enum"></code> `ImpurityReason` {#safeds.lang.ImpurityReason data-toc-label='[enum] ImpurityReason'}

A reason why a function is impure.

??? quote "Stub code in `purity.sdsstub`"

    ```sds linenums="28"
    enum ImpurityReason {

        /**
         * The function reads from a file and the file path is a constant.
         *
         * @param path The path of the file.
         */
        FileReadFromConstantPath(path: String)

        /**
         * The function reads from a file and the file path is given by a parameter.
         *
         * @param parameterName The name of the parameter that specifies the file path.
         */
        FileReadFromParameterizedPath(parameterName: String)

        /**
         * The function writes to a file and the file path is a constant.
         *
         * @param path The path of the file.
         */
        FileWriteToConstantPath(path: String)

        /**
         * The function writes to a file and the file path is given by a parameter.
         *
         * @param parameterName The name of the parameter that specifies the file path.
         */
        FileWriteToParameterizedPath(parameterName: String)

        /**
         * The function calls another, potentially impure function that gets passed as a parameter.
         *
         * @param parameterName The name of the parameter that accepts the function.
         */
        PotentiallyImpureParameterCall(parameterName: String)

        /**
         * The function is impure for some other reason. If possible, use a more specific reason.
         */
        Other
    }
    ```

## <code class="doc-symbol doc-symbol-variant"></code> `FileReadFromConstantPath` {#safeds.lang.ImpurityReason.FileReadFromConstantPath data-toc-label='[variant] FileReadFromConstantPath'}

The function reads from a file and the file path is a constant.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path of the file. | - |

## <code class="doc-symbol doc-symbol-variant"></code> `FileReadFromParameterizedPath` {#safeds.lang.ImpurityReason.FileReadFromParameterizedPath data-toc-label='[variant] FileReadFromParameterizedPath'}

The function reads from a file and the file path is given by a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that specifies the file path. | - |

## <code class="doc-symbol doc-symbol-variant"></code> `FileWriteToConstantPath` {#safeds.lang.ImpurityReason.FileWriteToConstantPath data-toc-label='[variant] FileWriteToConstantPath'}

The function writes to a file and the file path is a constant.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path of the file. | - |

## <code class="doc-symbol doc-symbol-variant"></code> `FileWriteToParameterizedPath` {#safeds.lang.ImpurityReason.FileWriteToParameterizedPath data-toc-label='[variant] FileWriteToParameterizedPath'}

The function writes to a file and the file path is given by a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that specifies the file path. | - |

## <code class="doc-symbol doc-symbol-variant"></code> `Other` {#safeds.lang.ImpurityReason.Other data-toc-label='[variant] Other'}

The function is impure for some other reason. If possible, use a more specific reason.

## <code class="doc-symbol doc-symbol-variant"></code> `PotentiallyImpureParameterCall` {#safeds.lang.ImpurityReason.PotentiallyImpureParameterCall data-toc-label='[variant] PotentiallyImpureParameterCall'}

The function calls another, potentially impure function that gets passed as a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that accepts the function. | - |