# :test_tube:{ title="Experimental" } `#!sds annotation` Tags {#safeds.lang.Tags data-toc-label='[annotation] Tags'}

Tags to associate with a declaration. They can be used for filtering.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `tags` | [`List<String>`][safeds.lang.List] | - | - |

**Targets:**

- `Annotation`
- `Class`
- `Enum`
- `Function`
- `Pipeline`
- `Schema`
- `Segment`

??? quote "Stub code in `ideIntegration.sdsstub`"

    ```sds linenums="71"
    annotation Tags(tags: List<String>)
    ```
