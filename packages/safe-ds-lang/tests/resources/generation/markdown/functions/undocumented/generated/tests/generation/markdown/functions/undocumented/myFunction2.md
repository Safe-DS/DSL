# `#!sds fun` myFunction2 {#tests.generation.markdown.functions.undocumented.myFunction2}

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | `#!sds TypeParam1` | - | - |
| `param2` | `#!sds TypeParam2` | - | - |
| `param3` | `#!sds TypeParam3` | - | - |

**Type parameters:**

| Name | Upper Bound | Description | Default |
|------|-------------|-------------|---------|
| `TypeParam1` | `#!sds Any?` | - | - |
| `TypeParam2` | `#!sds Int` | - | - |
| `TypeParam3` | `#!sds Any?` | - | `#!sds Int` |

??? quote "Source code in `main.sdsstub`"

    ```sds linenums="7"
    fun myFunction2<TypeParam1, TypeParam2 sub Int, TypeParam3 = Int>(
        param1: TypeParam1,
        param2: TypeParam2,
        param3: TypeParam3,
    )
    ```
