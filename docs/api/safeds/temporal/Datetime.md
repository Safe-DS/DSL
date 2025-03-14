[//]: # (DO NOT EDIT THIS FILE DIRECTLY. Instead, edit the corresponding stub file and execute `npm run docs:api`.)

# :test_tube:{ title="Experimental" } <code class="doc-symbol doc-symbol-class"></code> `Datetime` {#safeds.temporal.Datetime data-toc-label='[class] Datetime'}

A date and time.

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `year` | [`Int`][safeds.lang.Int] | The year. | - |
| `month` | [`Int`][safeds.lang.Int] | The month. Must be between 1 and 12. | - |
| `day` | [`Int`][safeds.lang.Int] | The day. Must be between 1 and 31. | - |
| `hour` | [`Int`][safeds.lang.Int] | The hour. Must be between 0 and 23. | - |
| `minute` | [`Int`][safeds.lang.Int] | The minute. Must be between 0 and 59. | - |
| `second` | [`Int`][safeds.lang.Int] | The second. Must be between 0 and 59. | - |
| `microsecond` | [`Int`][safeds.lang.Int] | The microsecond. Must be between 0 and 999,999. | `#!sds 0` |

??? quote "Stub code in `Datetime.sdsstub`"

    ```sds linenums="15"
    @Experimental
    @PythonName("datetime")
    class Datetime(
        year: Int,
        const month: Int,
        const day: Int,
        const hour: Int,
        const minute: Int,
        const second: Int,
        const microsecond: Int = 0
    ) where {
        month >= 1,
        month <= 12,
        day >= 1,
        day <= 31,
        hour >= 0,
        hour <= 23,
        minute >= 0,
        minute <= 59,
        second >= 0,
        second <= 59,
        microsecond >= 0,
        microsecond <= 999999
    } {
        /**
         * The year.
         */
        attr year: Int

        /**
         * The month.
         */
        attr month: Int

        /**
         * The day.
         */
        attr day: Int

        /**
         * The hour.
         */
        attr hour: Int

        /**
         * The minute.
         */
        attr minute: Int

        /**
         * The second.
         */
        attr second: Int

        /**
         * The microsecond.
         */
        attr microsecond: Int
    }
    ```
    { data-search-exclude }

## <code class="doc-symbol doc-symbol-attribute"></code> `day` {#safeds.temporal.Datetime.day data-toc-label='[attribute] day'}

The day.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `hour` {#safeds.temporal.Datetime.hour data-toc-label='[attribute] hour'}

The hour.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `microsecond` {#safeds.temporal.Datetime.microsecond data-toc-label='[attribute] microsecond'}

The microsecond.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `minute` {#safeds.temporal.Datetime.minute data-toc-label='[attribute] minute'}

The minute.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `month` {#safeds.temporal.Datetime.month data-toc-label='[attribute] month'}

The month.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `second` {#safeds.temporal.Datetime.second data-toc-label='[attribute] second'}

The second.

**Type:** [`Int`][safeds.lang.Int]

## <code class="doc-symbol doc-symbol-attribute"></code> `year` {#safeds.temporal.Datetime.year data-toc-label='[attribute] year'}

The year.

**Type:** [`Int`][safeds.lang.Int]
