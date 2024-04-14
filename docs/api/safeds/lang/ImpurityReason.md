# `#!sds enum` ImpurityReason {#safeds.lang.ImpurityReason data-toc-label='ImpurityReason'}

A reason why a function is impure.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

??? quote "Stub code in `purity.sdsstub`"

    ```sds linenums="42"
    enum ImpurityReason {
    
        /**
         * The function reads from a file and the file path is a constant.
         *
         * @param path The path of the file.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        FileReadFromConstantPath(path: String)
    
        /**
         * The function reads from a file and the file path is given by a parameter.
         *
         * @param parameterName The name of the parameter that specifies the file path.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        FileReadFromParameterizedPath(parameterName: String)
    
        /**
         * The function writes to a file and the file path is a constant.
         *
         * @param path The path of the file.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        FileWriteToConstantPath(path: String)
    
        /**
         * The function writes to a file and the file path is given by a parameter.
         *
         * @param parameterName The name of the parameter that specifies the file path.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        FileWriteToParameterizedPath(parameterName: String)
    
        /**
         * The function calls another, potentially impure function that gets passed as a parameter.
         *
         * @param parameterName The name of the parameter that accepts the function.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        PotentiallyImpureParameterCall(parameterName: String)
    
        /**
         * The function is impure for some other reason. If possible, use a more specific reason.
         *
         * @example
         * pipeline example {
         *     // TODO
         * }
         */
        Other
    }
    ```

## FileReadFromConstantPath {#safeds.lang.ImpurityReason.FileReadFromConstantPath data-toc-label='FileReadFromConstantPath'}

The function reads from a file and the file path is a constant.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path of the file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## FileReadFromParameterizedPath {#safeds.lang.ImpurityReason.FileReadFromParameterizedPath data-toc-label='FileReadFromParameterizedPath'}

The function reads from a file and the file path is given by a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that specifies the file path. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## FileWriteToConstantPath {#safeds.lang.ImpurityReason.FileWriteToConstantPath data-toc-label='FileWriteToConstantPath'}

The function writes to a file and the file path is a constant.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `path` | [`String`][safeds.lang.String] | The path of the file. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## FileWriteToParameterizedPath {#safeds.lang.ImpurityReason.FileWriteToParameterizedPath data-toc-label='FileWriteToParameterizedPath'}

The function writes to a file and the file path is given by a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that specifies the file path. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## Other {#safeds.lang.ImpurityReason.Other data-toc-label='Other'}

The function is impure for some other reason. If possible, use a more specific reason.

**Examples:**

```sds
pipeline example {
    // TODO
}
```

## PotentiallyImpureParameterCall {#safeds.lang.ImpurityReason.PotentiallyImpureParameterCall data-toc-label='PotentiallyImpureParameterCall'}

The function calls another, potentially impure function that gets passed as a parameter.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `parameterName` | [`String`][safeds.lang.String] | The name of the parameter that accepts the function. | - |

**Examples:**

```sds
pipeline example {
    // TODO
}
```
