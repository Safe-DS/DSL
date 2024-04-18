# `#!sds annotation` Targets {#safeds.lang.Targets data-toc-label='Targets'}

The annotation must target only the specified declaration types. By default, any declaration type can be targeted.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `targets` | [`List<AnnotationTarget>`][safeds.lang.List] | An exhaustive list of the valid targets. | - |

**Targets:**

- `Annotation`
- `Attribute`
- `Class`
- `Enum`
- `EnumVariant`
- `Function`
- `Module`
- `Parameter`
- `Pipeline`
- `Result`
- `Segment`
- `TypeParameter`

??? quote "Stub code in `annotationUsage.sdsstub`"

    ```sds linenums="9"
    annotation Targets(
        targets: List<AnnotationTarget>
    )
    ```
