# Your First Safe-DS Program

## Classification
[Link to Titanic Dataset](https://github.com/Safe-DS/Datasets/blob/main/src/safeds_datasets/tabular/_titanic/data/titanic.csv)


The Titanic dataset is a simple example for your first machine learning project. The dataset contains data about passengers who traveled on the Titanic. Obviously, not all passengers had the same chances of survival. This model is intended to generalize, based on the data, what characteristics characterize a person who has survived.


```sds
Package Titanic

Pipeline Titanic{
    // load the table from CSV file 
    val data = Table.fromCsvFile("titanic.csv"); 

    // using a mean imputer to fill up NULL-values with the Mean
    val meanImputer = SimpleImputer(SimpleImputer.Strategy.Mean); 
    val impMean, val titanicMeanImputed = meanImputer.fitAndTransform(titanicRemoved, ["age", "fare"]);

    //using a Median imputer to fill up NULL-values with the Median
    val medianImputer  = SimpleImputer(SimpleImputer.Strategy.Mode);
    val impMedian, val titanicMedianImputed = medianImputer.fitAndTransform(titanicMeanImputed, ["port_embarked"]); 

    /*Using a onehotencoder to convert categorical data into a binary
        format allows each category to be represented as a unique combination
        of binary variables, making it easier for machine learning algorithms 
        to process and interpret the data.*/
    val oneHotEncoder = OneHotEncoder(); 
    val enc, val titanicEncoded = oneHotEncoder.fitAndTransform(titanicMedianImputed, ["sex", "port_embarked"]);

    //using a discretizer to bin continuous data into intervals.
    val discretisizer = Discretizer();
    val disc, val titanicDiscretisized = discretisizer.fitAndTransform(titanicEncoded, ["fare"]);

    //using the datastructure plot to generate a heatmap
	val plot = titanic.plot.correlationHeatmap();

    /*Splitting the data and tagging the Target: 70% of the data 
        was used for training. The remaining 30% of the data was used for 
        testing.*/
    val trainigSet, val testSet = titanicDiscretisized.splitRows(0.7);
    val trainingTable = trainigSet.toTabularDataset("survived");
	val testTable = testSet.toTabularDataset("survived");

    //training the model with a Gradient Boosting Classifier
    val gbClassifier = GradientBoostingClassifier(10,0.2);
    val fittedgb = gbClassifier.fit(trainingTable);
    //calculating the accuracy
    val accuracygb = gbFitted.accuracy(testTable);
}
```
###[Table](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/containers/Table/#safeds.data.tabular.containers.Table) & [TabularDataset](https://dsl.safeds.com/en/stable/api/safeds/data/labeled/containers/TabularDataset/#safeds.data.labeled.containers.TabularDataset)


A Table is a two-dimensional collection of data. It can either be seen as a list of rows or as a list of columns.

A TabularDataSet is a dataset containing tabular data. It can be used to train machine learning models.


```sds
    val data = Table.fromCsvFile("titanic.csv"); 
    //...
    val trainigSet, val testSet = titanicDiscretisized.splitRows(0.7);
    val trainingTable = trainigSet.toTabularDataset("survived");
	val testTable = testSet.toTabularDataset("survived");
```

###[SimpleImputer](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/transformation/SimpleImputer/#safeds.data.tabular.transformation.SimpleImputer)


Replace missing values with the given strategy.


```sds
    val meanImputer = SimpleImputer(SimpleImputer.Strategy.Mean); 
    val impMean, val titanicMeanImputed = meanImputer.fitAndTransform(titanicRemoved, ["age", "fare"]);

    val medianImputer  = SimpleImputer(SimpleImputer.Strategy.Mode);
    val impMedian, val titanicMedianImputed = medianImputer.fitAndTransform(titanicMeanImputed, ["port_embarked"]); 
```

###[OneHotEncoder](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/transformation/OneHotEncoder/#safeds.data.tabular.transformation.OneHotEncoder)


A way to deal with categorical features that is particularly useful for unordered (i.e. nominal) data.


```sds
    val oneHotEncoder = OneHotEncoder(); 
    val enc, val titanicEncoded = oneHotEncoder.fitAndTransform(titanicMedianImputed, ["sex", "port_embarked"]);
```

###[Discretizer](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/transformation/Discretizer/#safeds.data.tabular.transformation.Discretizer)


The Discretizer bins continuous data into intervals.


```sds
    val discretisizer = Discretizer();
    val disc, val titanicDiscretisized = discretisizer.fitAndTransform(titanicEncoded, ["fare"]);
```

###[Plots](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/plotting/TablePlotter/#safeds.data.tabular.plotting.TablePlotter)
We used the [CorrelationHeatMap](https://dsl.safeds.com/en/stable/api/safeds/data/tabular/plotting/TablePlotter/#safeds.data.tabular.plotting.TablePlotter.correlationHeatmap)


A class that contains plotting methods for a table.


```sds
	val plot = titanic.plot.correlationHeatmap();
```



### Classifier

A classifier is a machine learning algorithm that categorizes data into predefined classes. It is trained on labeled data to learn patterns and then used to predict the class of new, unseen data.


In our excample we used the [GradientBoostingClassifier](http://127.0.0.1:8000/api/safeds/ml/classical/classification/GradientBoostingClassifier/#safeds.ml.classical.classification.GradientBoostingClassifier)

```sds
    val gbClassifier = GradientBoostingClassifier(10,0.2);
    val fittedgb = gbClassifier.fit(trainingTable);
    val accuracygb = gbFitted.accuracy(testTable);
```
