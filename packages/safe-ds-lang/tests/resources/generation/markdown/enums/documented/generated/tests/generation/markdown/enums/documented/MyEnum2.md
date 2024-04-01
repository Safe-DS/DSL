# `#!sds enum` MyEnum2 {#tests.generation.markdown.enums.documented.MyEnum2}

Description of MyEnum2.

??? quote "Source code in `main.sdsstub`"

    ```sds linenums="11"
    enum MyEnum2 {
        /**
         * Description of MyVariant1.
         */
        MyVariant1
    
        /**
         * Description of MyVariant2.
         *
         * @param param1 Description of param1.
         * @param param2 Description of param2.
         */
        MyVariant2(param1: MyClass1, param2: Float = 1.0)
    }
    ```

## MyVariant1 {#tests.generation.markdown.enums.documented.MyEnum2.MyVariant1}

Description of MyVariant1.

## MyVariant2 {#tests.generation.markdown.enums.documented.MyEnum2.MyVariant2}

Description of MyVariant2.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `param1` | [`#!sds MyClass1`][#tests.generation.markdown.enums.documented.MyClass1] | Description of param1. | - |
| `param2` | `#!sds Float` | Description of param2. | `1.0` |
