# Your First Safe-DS Classification Program

The [Titanic dataset](https://github.com/Safe-DS/Datasets/blob/main/src/safeds_datasets/tabular/_titanic/data/titanic.csv)
is a simple example for your first machine learning project. The dataset contains data about passengers on the Titanic.
Obviously, not all passengers had the same chances of survival. A model is intended to generalize, based on the data,
the characteristics of a survivor.

## File

Start by creating a file `titanic.sds`. The extension `.sds` is required, but the name can be anything you like.

## Package

All Safe-DS programs must declare their package at the beginning of the file. This groups related declarations from
different files together.

```sds
package classification
```

## Pipeline

Next you have to define your pipeline which is the entry point of your program:

```sds
pipeline titanic {
  // All further code must go here
}
```

## Reading Data

Place the
file [`titanic.csv`](https://github.com/Safe-DS/Datasets/blob/main/src/safeds_datasets/tabular/_titanic/data/titanic.csv)
in the same folder as your `.sds` file.
You can then create a [Table][safeds.data.tabular.containers.Table] with the data from the CSV file:

```sds
val rawData = Table.fromCsvFile("titanic.csv");
```

Now you can access the data via the variable `rawData`.

## Understanding the Data

Before you start building your model, it is important to understand the data you are working with. For example, you can
view the first few rows of the table to get an overview of the data:

```sds
val _head = rawData.sliceRows(length = 5);
```

Moreover, you can view important statistics about the data:

```sds
val _statistics = rawData.summarizeStatistics();
```

Plots, like a correlation heatmap that shows whether individual columns are linearly correlated, are also a great
starting point:

```sds
val _plot = rawData.plot.correlationHeatmap();
```

??? note "Underscore Prefix"

    The underscore prefix is a convention to indicate that a placeholder is not used again later in the code, but only
    exists to
    [inspect its value](../pipeline-language/statements/assignments.md#inspecting-placeholder-values-in-vs-code). The
    prefix turns off the warning that the placeholder is not used.

## Removing Columns

Some columns might not be useful for training the model and should be removed. In this case, we have decided to remove
the columns `cabin`, `ticket`, and `port_embarked:

```sds
val preprocessedBeforeSplit = rawData.removeColumns(["cabin", "ticket", "port_embarked"]);
```

Usually, you would also remove the `id` and `name` columns, since you don't want models to learn a mapping from id-like
columns to the target variable. However, we will show [another way](#creating-a-tabulardataset) to deal with these
columns without removing them, since they are still highly useful to map predictions of the model to passengers.

## Splitting the Data

Before we learn any data transformations or train a model, we need to split the data into a training and a test set. The
training set is used to train the model, while the test set is used to evaluate the model's performance on unseen data.

```sds
val rawTraining, val rawTest = preprocessedBeforeSplit.splitRows(percentageInFirst = 0.7);
```

This deterministically shuffles the rows and splits the data into two parts. The first part contains 70% of the rows and
is assigned to `rawTraining`, while the second part is assigned to `rawTest`.

## Fitting a [SimpleImputer][safeds.data.tabular.transformation.SimpleImputer]

Most models cannot handle missing values. An imputer is used to replace missing values using various strategies. In this
case, we replace missing values of the columns `age` and `fare` with the median of the respective columns.

```sds
val imputer = SimpleImputer(SimpleImputer.Strategy.Median, columnNames = ["age", "fare"]).fit(rawTraining);
```

Note that we first configure an imputer using its constructor and then fit it to the training data with the `fit` call.

## Fitting [OneHotEncoder][safeds.data.tabular.transformation.OneHotEncoder]

Most models can only handle numerical data. Categorical data must be encoded into numerical data. One way to do this is
one-hot encoding. This creates a new column for each category in a categorical column and assigns a 1 or 0 to indicate
the presence of the category. This is particularly useful for unordered (i.e. nominal) data. We apply this to the `sex`
column:

```sds
val encoder = OneHotEncoder(columnNames = ["sex"]).fit(rawTraining);
```

## Transforming the Data with Fitted Transformers

Now that we have fitted the imputer and encoder, we can transform the training and test data:

```sds
val transformedTraining = encoder.transform(imputer.transform(rawTraining));
val transformedTest = encoder.transform(imputer.transform(rawTest));
```

This sequentially applies the imputer and encoder to the training and test data. Unfortunately, the nested calls are
not particularly readable, since they must be read from the inside out. We can improve this by using the method
[`Table.transformTable`][safeds.data.tabular.containers.Table.transformTable], which applies a fitted transformer to a
table and returns the transformed table:

```sds
val transformedTraining = rawTraining.transformTable(imputer).transformTable(encoder);
val transformedTest = rawTest.transformTable(imputer).transformTable(encoder);
```

This is slightly longer but readable from left to right.

## Creating a [TabularDataset][safeds.data.labeled.containers.TabularDataset]

Before we can train a model with the data, we need to attach additional metadata, like which column is the target to
predict or which columns should be ignored during training. The latter can be used for id-like columns like `id` and
`name`. We can create a tabular dataset from the transformed training data:

```sds
val trainingSet = transformedTraining.toTabularDataset(
    targetName = "survived",
    extraNames = ["id", "name"]
);
```

## Fitting a [Classifier][safeds.ml.classical.classification.Classifier]

Finally, we train a classifier on the data. A classifier categorizes data into predefined classes. In our example we use
the [gradient boosting classifier][safeds.ml.classical.classification.GradientBoostingClassifier]:

```sds
val classifier = GradientBoostingClassifier(treeCount = 10, learningRate = 0.2).fit(trainingSet);
```

Like the transformers, we first configure the classifier using its constructor and then `fit` it to the training data.
Unlike the transformers, however, the classifier expects a tabular dataset as input.

## Evaluating the Fitted Classifier

To evaluate the classifier, we can for example evaluate its accuracy on the test data:

```sds
val _accuracy = classifier.accuracy(transformedTest);
```

## Full Code

```sds title="titanic.sds"
--8<-- "getting-started/snippets/titanic-1.sds"
```

## Reusing Code with Segments

After splitting, we want to ensure to apply the same transformations to the training and test data. Currently, this
means we have to manually apply the transformations to both datasets. This is not only cumbersome but also error-prone,
since we might forget to apply a transformation to one of the datasets.

Segments (like functions in other programming languages) allow you to reuse code. You can define a segment that applies
the transformations to the data and then call this segment for both the training and test data.

```sds
segment preprocessAfterSplit(
    table: Table,
    imputer: TableTransformer,
    encoder: TableTransformer,
) -> dataset: TabularDataset {
    yield dataset = table
        .transformTable(imputer)
        .transformTable(encoder)
        .toTabularDataset(targetName = "survived", extraNames = ["id", "name"]);
}
```

The segment takes a table, an imputer, and an encoder as parameters and returns a
[tabular dataset][safeds.data.labeled.containers.TabularDataset]. Inside the pipeline, we can call the segment to
transform the training and test data:

```sds
val trainingSet = preprocessAfterSplit(rawTraining, imputer, encoder);
val testSet = preprocessAfterSplit(rawTest, imputer, encoder);
```

Currently, this increases the verbosity of the code, but the major benefit is that we only need to add new
transformations to the segment and they will be applied to both the training and test data.

!!! note "Composite transformers"

    We are also currently working on a feature to combine multiple transformers into one. This will allow you to fit,
    apply, and pass around multiple transformers at once, greatly reducing the verbosity of your code. You can track
    progress [here](https://github.com/Safe-DS/Library/issues/802).

## Full Code with Segment

```sds title="titanic.sds"
--8<-- "getting-started/snippets/titanic-2.sds"
```
