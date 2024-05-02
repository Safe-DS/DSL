# :test_tube:{ title="Experimental" } `#!sds class` InputConversionTable {#safeds.ml.nn.InputConversionTable data-toc-label='InputConversionTable'}

The input conversion for a neural network defines the input parameters for the neural network.

**Parent type:** [`InputConversion<TabularDataset, Table>`][safeds.ml.nn.InputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `featureNames` | [`List<String>`][safeds.lang.List] | The names of the features for the input table, used as features for the training. | - |
| `targetName` | [`String`][safeds.lang.String] | The name of the target for the input table, used as target for the training. | - |

??? quote "Stub code in `input_conversion_table.sdsstub`"

    ```sds linenums="10"
    class InputConversionTable(
        @PythonName("feature_names") featureNames: List<String>,
        @PythonName("target_name") targetName: String
    ) sub InputConversion<TabularDataset, Table>
    ```
