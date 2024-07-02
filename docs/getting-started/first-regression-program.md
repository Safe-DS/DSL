# Your First Safe-DS Regression Program

Usually it's suggested to start your learning journey by printing "Hello World!", but since Safe-DS is a language for
data science, we are going to step further with this short tutorial: You will learn how to write your first Safe-DS
pipeline, which will import data from a CSV file, train a regression model and print the mean squared error of that
fitted model.

## File

Start by creating a file with the extension `.sds`.

## Package

All Safe-DS programs must declare their packages at the beginning of the file.

```sds
package regression
```

## Pipeline

Next you have to define your pipeline which is the main part of your program. Pipelines are data science programs
designed to solve a specific task. They act as the entry point to start execution.

```sds
pipeline demo {
  // All further code must go here
}
```

## Reading Data

Using data from other files can be done easily by placing your data files in the same folder as your `.sds` file. It's
common to use `.csv` files for data, so we will use them as well. Once you placed your file into that folder, you can
write the following line to create a table.

```sds
val rawData = Table.fromCsvFile("input.csv");
```

Now you can use your data by accessing the variable `rawData`.

## Cleaning Your Data

At this point is usual to clean your data. If your data needs no cleaning, you can skip this part.

Removing columns:

```sds
val removedColumns = rawData.removeColumns(["columnName"]);
```

You can now access your data by its new name `removedColumns`.

Removing rows:

```sds
val removedRows = removedColumns.removeRowsWithMissingValues();
```

You can also use an imputer in order to replace missing values with these different strategies:

- `SimpleImputer.Strategy.Mean` (replace missing values with the mean of the column)
- `SimpleImputer.Strategy.Median` (replace missing values with the median of the column)
- `SimpleImputer.Strategy.Mode` (replace missing values with the most frequent value of the column)
- `SimpleImputer.Strategy.Constant` (replace missing values with a constant value)

```sds
val columnsToImpute = ["columnName1", "columnName2"];
val fittedImputer = SimpleImputer(SimpleImputer.Strategy.Mean, columnsToImpute).fit(removedRows);
val imputedData = fittedImputer.transform(removedRows);
```

You can also use an label encoder to label specific values if your data is ordinal:

```sds
val columnsToEncode = ["columnName3", "columnName4"];
val fittedLabelEncoder = LabelEncoder(columnsToEncode).fit(imputedData);
val labeledData = fittedLabelEncoder.transform(imputedData);
```

It's also possible to use a one-hot encoder if your data is nominal:

```sds
val columnsToOneHotEncode = ["columnName5", "columnName6"];
val fittedOneHotEncoder = OneHotEncoder(columnsToOneHotEncode).fit(labeledData);
val oneHotEncodedData = fittedOneHotEncoder.transform(labeledData);
```

## Create Training and Testing Set

In order to train a model on your data and later evaluate its performance, you have to create a test and training set:

```sds
val train, val test = oneHotEncodedData.splitRows(0.7);
val trainSet = train.toTabularDataset("targetColumnName");
val testSet = test.toTabularDataset("targetColumnName");
```

## Regressor

Now you can train the data using a
regressor: [Here](https://dsl.safeds.com/en/stable/api/safeds/ml/classical/regression/Regressor/) you can find other
regressors. Create your regressor simply by initializing and assigning it to a variable.

```sds
val regressor = DecisionTreeRegressor();
```

## Fitting a Regressor

Once you have defined your regressor, you can fit that regressor by calling the fit function
and passing your train set.

```sds
val fittedRegressor = regressor.fit(trainSet);
```

## Predicting with the Fitted Regressor

Now you can use your regressor to predict target values on your test set:

```sds
val _prediction = fittedRegressor.predict(testSet);
```

## Evaluating the Fitted Regressor

Last but not least you might want to test evaluate model, which is easily achieved by these lines:

```sds
val _metrics = fittedRegressor.summarizeMetrics(testSet);
```

## Full Code

```sds
package regression

pipeline demo {
    // Read data
    val rawData = Table.fromCsvFile("input.csv");

    // Remove columns and rows
    val removedColumns = rawData.removeColumns(["columnName"]);
    val removedRows = removedColumns.removeRowsWithMissingValues();

    // Impute
    val columnsToImpute = ["columnName1", "columnName2"];
    val fittedImputer = SimpleImputer(SimpleImputer.Strategy.Mean, columnsToImpute).fit(removedRows);
    val imputedData = fittedImputer.transform(removedRows);

    // Label encoding
    val columnsToEncode = ["columnName3", "columnName4"];
    val fittedLabelEncoder = LabelEncoder(columnsToEncode).fit(imputedData);
    val labeledData = fittedLabelEncoder.transform(imputedData);

    // One-hot encoding
    val columnsToOneHotEncode = ["columnName5", "columnName6"];
    val fittedOneHotEncoder = OneHotEncoder(columnsToOneHotEncode).fit(labeledData);
    val oneHotEncodedData = fittedOneHotEncoder.transform(labeledData);

    // Split and tag data
    val train, val test = oneHotEncodedData.splitRows(0.7);
    val trainSet = train.toTabularDataset("targetColumnName");
    val testSet = test.toTabularDataset("targetColumnName");

    // Define and train a regressor
    val regressor = DecisionTreeRegressor();
    val fittedRegressor = regressor.fit(trainSet);

    // Predict and evaluate
    val _prediction = fittedRegressor.predict(testSet);
    val _metrics = fittedRegressor.summarizeMetrics(testSet);
}
```
