# `#!sds abstract class` MyClass6 {#tests.generation.markdown.classes.documented.MyClass6 data-toc-label='MyClass6'}

Description of MyClass6.

**Inheritors:**

- [`MyClass8`][tests.generation.markdown.classes.documented.MyClass8]

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="38"
    class MyClass6 {
        /**
         * Description of MyClass7.
         */
        class MyClass7 {
            /**
             * Description of myAttribute4.
             */
            attr myAttribut4: Int
            /**
             * Description of myAttribute3.
             *
             * @example // Example of myAttribute3.
             */
            attr myAttribute3: Int
        }

        /**
         * Description of MyEnum1.
         */
        enum MyEnum1 {
            /**
             * Description of MyVariant1.
             */
            MyVariant1
        }

        /**
         * Description of myFunction1.
         */
        @Pure fun myFunction1()
        /**
         * Description of myFunction2.
         */
        @Pure static fun myFunction2()

        /**
         * Description of myAttribute1.
         */
        attr myAttribute1: MyClass1
        /**
         * Description of myAttribute2.
         */
        static attr myAttribute2: Float
    }
    ```

## `#!sds attr` myAttribute1 {#tests.generation.markdown.classes.documented.MyClass6.myAttribute1 data-toc-label='myAttribute1'}

Description of myAttribute1.

**Type:** [`MyClass1`][tests.generation.markdown.classes.documented.MyClass1]

## `#!sds fun` myFunction1 {#tests.generation.markdown.classes.documented.MyClass6.myFunction1 data-toc-label='myFunction1'}

Description of myFunction1.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="68"
    @Pure fun myFunction1()
    ```

## `#!sds static attr` myAttribute2 {#tests.generation.markdown.classes.documented.MyClass6.myAttribute2 data-toc-label='myAttribute2'}

Description of myAttribute2.

**Type:** `#!sds Float`

## `#!sds static fun` myFunction2 {#tests.generation.markdown.classes.documented.MyClass6.myFunction2 data-toc-label='myFunction2'}

Description of myFunction2.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="72"
    @Pure static fun myFunction2()
    ```

---
search:
  boost: 0.5
---

## `#!sds abstract class` MyClass7 {#tests.generation.markdown.classes.documented.MyClass6.MyClass7 data-toc-label='MyClass7'}

Description of MyClass7.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="42"
    class MyClass7 {
        /**
         * Description of myAttribute4.
         */
        attr myAttribut4: Int
        /**
         * Description of myAttribute3.
         *
         * @example // Example of myAttribute3.
         */
        attr myAttribute3: Int
    }
    ```

### `#!sds attr` myAttribut4 {#tests.generation.markdown.classes.documented.MyClass6.MyClass7.myAttribut4 data-toc-label='myAttribut4'}

Description of myAttribute4.

**Type:** `#!sds Int`

### `#!sds attr` myAttribute3 {#tests.generation.markdown.classes.documented.MyClass6.MyClass7.myAttribute3 data-toc-label='myAttribute3'}

Description of myAttribute3.

**Type:** `#!sds Int`

**Examples:**

```sds
// Example of myAttribute3.
```

## `#!sds enum` MyEnum1 {#tests.generation.markdown.classes.documented.MyClass6.MyEnum1 data-toc-label='MyEnum1'}

Description of MyEnum1.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="58"
    enum MyEnum1 {
        /**
         * Description of MyVariant1.
         */
        MyVariant1
    }
    ```

### MyVariant1 {#tests.generation.markdown.classes.documented.MyClass6.MyEnum1.MyVariant1 data-toc-label='MyVariant1'}

Description of MyVariant1.
