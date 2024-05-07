# :test_tube:{ title="Experimental" } `#!sds class` OutputConversionTable {#safeds.ml.nn.OutputConversionTable data-toc-label='OutputConversionTable'}

The output conversion for a neural network defines the output parameters for the neural network.

**Parent type:** [`OutputConversion<Table, TabularDataset>`][safeds.ml.nn.OutputConversion]

**Parameters:**

| Name | Type | Description | Default |
|------|------|-------------|---------|
| `predictionName` | [`String`][safeds.lang.String] | The name of the new column where the prediction will be stored. | `#!sds "prediction"` |

??? quote "Stub code in `output_conversion_table.sdsstub`"

    ```sds linenums="9"
    class OutputConversionTable(
        @PythonName("prediction_name") predictionName: String = "prediction"
    ) sub OutputConversion<Table, TabularDataset>
    ```
