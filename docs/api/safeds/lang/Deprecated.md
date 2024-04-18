# `#!sds annotation` Deprecated {#safeds.lang.Deprecated data-toc-label='Deprecated'}

The declaration should no longer be used.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `alternative` | [`String?`][safeds.lang.String] | What to use instead. | `#!sds null` |
| `reason` | [`String?`][safeds.lang.String] | Why the declaration was deprecated. | `#!sds null` |
| `sinceVersion` | [`String?`][safeds.lang.String] | When the declaration was deprecated. | `#!sds null` |
| `removalVersion` | [`String?`][safeds.lang.String] | When the declaration will be removed. | `#!sds null` |

**Targets:**

- `Annotation`
- `Attribute`
- `Class`
- `Enum`
- `EnumVariant`
- `Function`
- `Parameter`
- `Result`
- `Schema`
- `Segment`

??? quote "Stub code in `maturity.sdsstub`"

    ```sds linenums="23"
    annotation Deprecated(
        alternative: String? = null,
        reason: String? = null,
        sinceVersion: String? = null,
        removalVersion: String? = null,
    )
    ```
