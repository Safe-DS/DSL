# `#!sds attr` myFunction2 {#tests.generation.markdown.functions.documented.myFunction2 data-toc-label='myFunction2'}

Description of myFunction2.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | `#!sds TypeParam1` | - | - |
| `param2` | `#!sds TypeParam2` | - | - |
| `param3` | `#!sds TypeParam3` | - | - |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `TypeParam1` | `#!sds Any?` | Description of TypeParam1. | - |
| `TypeParam2` | [`#!sds MyClass1`][tests.generation.markdown.functions.documented.MyClass1] | Description of TypeParam2. | - |
| `TypeParam3` | `#!sds Any?` | Description of TypeParam3. | [`#!sds MyClass1`][tests.generation.markdown.functions.documented.MyClass1] |

??? quote "Source code in `main.sdsstub`"

    ```sds linenums="17"
    fun myFunction2<TypeParam1, TypeParam2 sub MyClass1, TypeParam3 = MyClass1>(
        param1: TypeParam1,
        param2: TypeParam2,
        param3: TypeParam3,
    )
    ```
