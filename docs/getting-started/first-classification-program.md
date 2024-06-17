# Your First Safe-DS Classification Program

The [Titanic dataset](https://github.com/Safe-DS/Datasets/blob/main/src/safeds_datasets/tabular/_titanic/data/titanic.csv)
is a simple example for your first machine learning project. The dataset contains data about passengers who traveled on
the Titanic. Obviously, not all passengers had the same chances of survival. This model is intended to generalize, based
on the data, what characteristics a person who has survived had.

```sds
package classification

pipeline titanic {
    // Load the table from CSV file
    val data = Table.fromCsvFile("titanic.csv");

    // Using a mean imputer to replace missing values with the mean
    val meanImputer = SimpleImputer(SimpleImputer.Strategy.Mean);
    val impMean, val titanicMeanImputed = meanImputer.fitAndTransform(titanicRemoved, ["age", "fare"]);

    // Using a median imputer to replace missing values with the median
    val medianImputer  = SimpleImputer(SimpleImputer.Strategy.Mode);
    val impMedian, val titanicMedianImputed = medianImputer.fitAndTransform(titanicMeanImputed, ["port_embarked"]);

    // Using a one-hot encoder to convert categorical data into a binary
    // format allows each category to be represented as a unique combination
    // of binary variables, making it easier for machine learning algorithms
    // to process and interpret the data.
    val oneHotEncoder = OneHotEncoder();
    val enc, val titanicEncoded = oneHotEncoder.fitAndTransform(titanicMedianImputed, ["sex", "port_embarked"]);

    // Using a discretizer to bin continuous data into intervals.
    val discretizer = Discretizer();
    val disc, val titanicDiscretized = discretizer.fitAndTransform(titanicEncoded, ["fare"]);

    // Using the datastructure plot to generate a heatmap
	val plot = titanic.plot.correlationHeatmap();

    // Splitting the data and tagging the Target: 70% of the data
    // was used for training. The remaining 30% of the data was used for
    // testing.
    val trainigSet, val testSet = titanicDiscretized.splitRows(0.7);
    val trainingTable = trainigSet.toTabularDataset("survived");
	val testTable = testSet.toTabularDataset("survived");

    // Training the model with a gradient boosting classifier
    val gbClassifier = GradientBoostingClassifier(10,0.2);
    val fittedgb = gbClassifier.fit(trainingTable);

    // Calculating the accuracy
    val accuracygb = gbFitted.accuracy(testTable);
}
```

## [Table][safeds.data.tabular.containers.Table] & [TabularDataset][safeds.data.labeled.containers.TabularDataset]

A Table is a two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

A TabularDataSet is a dataset containing tabular data. It can be used to train machine learning models.

```sds
val data = Table.fromCsvFile("titanic.csv");
//...
val trainigSet, val testSet = titanicDiscretized.splitRows(0.7);
val trainingTable = trainigSet.toTabularDataset("survived");
val testTable = testSet.toTabularDataset("survived");
```

## [SimpleImputer][safeds.data.tabular.transformation.SimpleImputer]

Replace missing values with the given strategy.

```sds
val meanImputer = SimpleImputer(SimpleImputer.Strategy.Mean);
val impMean, val titanicMeanImputed = meanImputer.fitAndTransform(titanicRemoved, ["age", "fare"]);

val medianImputer  = SimpleImputer(SimpleImputer.Strategy.Mode);
val impMedian, val titanicMedianImputed = medianImputer.fitAndTransform(titanicMeanImputed, ["port_embarked"]);
```

## [OneHotEncoder][safeds.data.tabular.transformation.OneHotEncoder]

A way to deal with categorical features that is particularly useful for unordered (i.e. nominal) data.

```sds
val oneHotEncoder = OneHotEncoder();
val enc, val titanicEncoded = oneHotEncoder.fitAndTransform(titanicMedianImputed, ["sex", "port_embarked"]);
```

## [Discretizer][safeds.data.tabular.transformation.Discretizer]

The Discretizer bins continuous data into intervals.

```sds
val discretizer = Discretizer();
val disc, val titanicDiscretized = discretizer.fitAndTransform(titanicEncoded, ["fare"]);
```

## [Plots][safeds.data.tabular.plotting.TablePlotter]

We used the [correlation heat map][safeds.data.tabular.plotting.TablePlotter.correlationHeatmap]

A class that contains plotting methods for a table.

```sds
val plot = titanic.plot.correlationHeatmap();
```

## [Classifier][safeds.ml.classical.classification.Classifier]

A classifier is a machine learning algorithm that categorizes data into predefined classes. It is trained on labeled
data to learn patterns and then used to predict the class of new, unseen data.

In our example we used
the [gradiant boosting classifier][safeds.ml.classical.classification.GradientBoostingClassifier]

```sds
val gbClassifier = GradientBoostingClassifier(10,0.2);
val fittedgb = gbClassifier.fit(trainingTable);
val accuracygb = gbFitted.accuracy(testTable);
```
