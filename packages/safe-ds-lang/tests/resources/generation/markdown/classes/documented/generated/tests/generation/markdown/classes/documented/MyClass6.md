# <code class="doc-symbol doc-symbol-class"></code> `MyClass6` {#tests.generation.markdown.classes.documented.MyClass6 data-toc-label='[class] MyClass6'}

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

## <code class="doc-symbol doc-symbol-attribute"></code> `myAttribute1` {#tests.generation.markdown.classes.documented.MyClass6.myAttribute1 data-toc-label='[attribute] myAttribute1'}

Description of myAttribute1.

**Type:** [`MyClass1`][tests.generation.markdown.classes.documented.MyClass1]

## <code class="doc-symbol doc-symbol-function"></code> `myFunction1` {#tests.generation.markdown.classes.documented.MyClass6.myFunction1 data-toc-label='[function] myFunction1'}

Description of myFunction1.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="68"
    @Pure fun myFunction1()
    ```

## <code class="doc-symbol doc-symbol-static-attribute"></code> `myAttribute2` {#tests.generation.markdown.classes.documented.MyClass6.myAttribute2 data-toc-label='[static-attribute] myAttribute2'}

Description of myAttribute2.

**Type:** `#!sds Float`

## <code class="doc-symbol doc-symbol-static-function"></code> `myFunction2` {#tests.generation.markdown.classes.documented.MyClass6.myFunction2 data-toc-label='[static-function] myFunction2'}

Description of myFunction2.

??? quote "Stub code in `main.sdsstub`"

    ```sds linenums="72"
    @Pure static fun myFunction2()
    ```

---
search:
  boost: 0.5
---

## <code class="doc-symbol doc-symbol-class"></code> `MyClass7` {#tests.generation.markdown.classes.documented.MyClass6.MyClass7 data-toc-label='[class] MyClass7'}

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

### <code class="doc-symbol doc-symbol-attribute"></code> `myAttribut4` {#tests.generation.markdown.classes.documented.MyClass6.MyClass7.myAttribut4 data-toc-label='[attribute] myAttribut4'}

Description of myAttribute4.

**Type:** `#!sds Int`

### <code class="doc-symbol doc-symbol-attribute"></code> `myAttribute3` {#tests.generation.markdown.classes.documented.MyClass6.MyClass7.myAttribute3 data-toc-label='[attribute] myAttribute3'}

Description of myAttribute3.

**Type:** `#!sds Int`

**Examples:**

```sds hl_lines="1"
// Example of myAttribute3.
```

## <code class="doc-symbol doc-symbol-enum"></code> `MyEnum1` {#tests.generation.markdown.classes.documented.MyClass6.MyEnum1 data-toc-label='[enum] MyEnum1'}

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

### <code class="doc-symbol doc-symbol-variant"></code> `MyVariant1` {#tests.generation.markdown.classes.documented.MyClass6.MyEnum1.MyVariant1 data-toc-label='[variant] MyVariant1'}

Description of MyVariant1.
