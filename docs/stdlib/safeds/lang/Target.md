# `#!sds annotation` Target {#safeds.lang.Target data-toc-label='Target'}

The annotation must target only the specified declaration types. By default, any declaration type can be targeted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targets` | [`List<AnnotationTarget>`][safeds.lang.List] | An exhaustive list of the valid targets. | - |

**Targets:**

- `Annotation`

??? quote "Source code in `annotationUsage.sdsstub`"

    ```sds linenums="9"
    annotation Target(
        targets: List<AnnotationTarget>
    )
    ```
