# Your First Safe-DS Program

Usually it's suggested to start your learning journey by printing "Hello World!" but we are going to step further with this short
tutorial. In this tutorial you will learn how to write your first Safe-DS pipeline, which will import data from a csv file,
train a regression model and print the mean squared error of that fitted model. In order to do so, start by creating a .sds file.

1. Package

    All Safe-DS programs must declare their packages at the beginning of the file.
    ```sds 
    package demo 
    ```


2. Pipeline

    Next you have to define your pipeline which is the main part of your program.
    Pipelines are data science programs designed to solve a specific task. They act as the entry point to start execution.
    ```sds
    pipeline demoPipeline {
      // Every further code must go here
    }
    ```        


3. Integrate data

    Using data from other files can be done easily by placing your data files in the same folder as your .sds file.
    It's common to use .csv files for data so we will use them as well.
    Once you placed your file into that folder, you can write the following line to create a table. 
    ```sds
    val rawData = Table.fromCsvFile("input.csv");
    ```
    Now you can use your data by accessing the variable `rawData`. 


4. Cleaning your data

    At this point is usual to clean your data so if your data needs no cleaning, you can skip this part.

    Removing columns:
    ```sds
    val removedColumns = result.removeColumns(["columnName"]);
    ```
    You can now access your data by it's new name `removedColumns`.

    Removing rows:
    ```sds
    val removedRows = removedColumns.removeRowswithMissingValues();
    ```

    You can also use an imputer in order to replace missing values with these different strategies:

    - `SimpleImputer.Strategy.Mean`

    - `SimpleImputer.Strategy.Median`

    - `SimpleImputer.Strategy.Mode`

    - `SimpleImputer.Strategy.Constant`

    ```sds
    val columnsToImpute = ["columnName1", "columnName2"];
    val fittedImputer = SimpleImputer(SimpleImputer.Strategy.Mean).fit(removedRows, columnsToImpute);
    val imputedData = fittedImputer.transform(removedRows);
    ```

    You can also use an label encoder to label specific values if your data is ordinal
    ```sds
    val columnsToEncode = ["columnName3", "columnName4"];
    val fittedLabelEncoder = LabelEncoder().fit(removedRows, columnsToEncode);
    val labeldData = fittedLabelEncoder.transform(removedRows);
    ```

    It's also possible to use an one hot encoder if your data is nomial.
    ```sds
    val columnsToOneHotEncode = ["columnName5", "columnName6"];
    val fittedOneHotEncoder = OneHotEncoder().fit(removedRows, columnsToOneHotEncode);
    val oneHotEncodedData = fittedOneHotEncoder.transform(removedRows);
    ```


5. Create Training and Testing Set

    In order to train a model on your data, you have to create a test and training set.
    ```sds
    val train, val test = data.splitRows(0.7);
    val trainSet = train.toTabularDataset("targetColumnName");
    val testSet = test.toTabularDataset("targetColumnName");
    ```


6. Regressor

    Now you can train the data using a Regressor: 
    [Here](https://dsl.safeds.com/en/stable/api/safeds/ml/classical/regression/Regressor/) 
    you can find other regressors.
    Create your regressor simply by initializing and assigning it to a variable.
    ```sds
    val regressor = DecisionTreeRegressor();
    ```


7. Fitting a regressor

    Once you have defined your regressor, you can fit that regressor by calling the fit function
    and passing your train set.
    ```sds
    val fittedRegressor = regressor.fit(trainSet);
    ```


8. Use fitted regressor

    Now you can use your regressor on your test data and print the mean squared error for example.
    ```sds
    val error = fittedRegressor.meanSquaredError(testSet);
    ```


9. Show your results
    Last but not least you might want to test your model, which is easily achieved by these lines.
    ```sds
    val predicted = fittetRegressor.predict(testSet);
    val metrics = ClassificationMetrics.summarize(predicted, testSet, "valueOfPositiveClass");
    ```


10. Full code

    ```sds
    package demo 

    pipeline demoPipeline {
      val rawData = Table.fromCsvFile("input.csv");

      // removing columns and rows
      val removedColumns = result.removeColumns(["columnName"]);
      val removedRows = removedColumns.removeRowswithMissingValues();

      // impute
      val columnsToImpute = ["columnName1", "columnName2"];
      val fittedImputer = SimpleImputer(SimpleImputer.Strategy.Mean).fit(removedRows, columnsToImpute);
      val imputedData = fittedImputer.transform(removedRows);

      // label encode
      val columnsToEncode = ["columnName3", "columnName4"];
      val fittedLabelEncoder = LabelEncoder().fit(removedRows, columnsToEncode);
      val labeldData = fittedLabelEncoder.transform(removedRows);

      // one hot encode
      val columnsToOneHotEncode = ["columnName5", "columnName6"];
      val fittedOneHotEncoder = OneHotEncoder().fit(removedRows, columnsToOneHotEncode);
      val oneHotEncodedData = fittedOneHotEncoder.transform(removedRows);

      // split and tag data
      val train, val test = data.splitRows(0.7);
      val trainSet = train.toTabularDataset("targetColumnName");
      val testSet = test.toTabularDataset("targetColumnName");

      // define and regressor
      val regressor = DecisionTreeRegressor();
      val fittedRegressor = regressor.fit(trainSet);

      // print results
      val error = fittedRegressor.meanSquaredError(testSet);
      val predicted = fittetRegressor.predict(testSet);
      val metrics = ClassificationMetrics.summarize(predicted, testSet, "valueOfPositiveClass");
    }
    ```