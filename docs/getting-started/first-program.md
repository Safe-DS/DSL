# Your First Safe-DS Program

1. Package<br>
    All Safe-DS programs must declare their packages at the beginning of the file. Here your first example<br>
        ```sds 
        package demo 
        ```
2. Pipeline

    Pipelines are data science programs designed to solve a specific task. They act as the entry point to start execution.
    ```sds
    pipeline demopipeline{
        //Every further code must go here
    }
    ```        

3. Integrate data
    In order to use your data, it is easy if you can put it into the same folder. You can to create a table from a CSV file. 
    ```sds
    val result = Table.fromCsvFile("input.csv");
    ```
    Now you can use your data through the variable result. 
4. Cleaning the data
    If necessary you can clean the data now.

    You can remove columns:
    ```sds
    val removeColoumns=result.removeColumns(["columnName"]);
    ```
    You can now use your data under the new Name "removeColoumns".

    You can also remove rows with missing values
    ```sds
    val removedRows=removeColoumns.removeRowswithMissingValues();
    ```

    You can use an imputer in order to replace missing values with  Mean/Mode/static Value
    ```sds
    val columnsToImpute=["coloumnName"];
    val imputer=SimpleImputer(SimpleImputer.Strategy.Mean).fit(removedRows, columnsToImpute);
    val imputedData=imputer.transform(removedRows);
    ```

    You can use lable Encoder to label specific values
    ```sds
    val columnsToEncode=["coloumnName"];
    val labelEncoder=LabelEncoder().fit(removedRows, ColumnsToEncode);
    val labeldData=labelEncoder.transform(removedRows);
    ```

    Its also possible to use One Hot Encoder if your data is non numerical and has no order.
    ```sds
    val columnsOneHotEncode=["coloumnName"];
    val oneHotEncoder=OneHotEncoder().fit(removedRows, columnsToOneHotEncode);
    vak oneHotEncodeddata=ioneHotEncoder.transform(removedRows);
    ```
5. Create Training and Testing Set
    In order to train on the data you have to create a test and a traning set
    ```sds
    val train, val test=oneHotEncodedData.splitRows(0.7);
    val trainSet=train.toTabularDataset("targetColumnName");
    val testSet=test.toTabularDataset("targetColumnName");
    ```
6. Regressor
    You can now train the data using a Regressor: You can find the other regressors [here](https://dsl.safeds.com/en/stable/api/safeds/ml/classical/regression/Regressor/).
    ```sds
    val regressor=DecisionTreeRegressor();
    ```
7. Fitting regressor
    You have to fit your choosen Regressor for training.
    ```
    val fittedRegrssor=regressor.fit(trainSet);
    ```
8. Use fitted regressor
    Now you can use your Regressor on your testing data
    ```sds
    val error=fittedRegressor.meanSquaredError(testSet);
    ```
9. Show your results
    ```sds
    val predicted=fittetRegressor.predict(testSet);
    val metrics=ClassificationMetrics.summarize(predicted, testSet, "valueOfPositiveClass");
    ```
