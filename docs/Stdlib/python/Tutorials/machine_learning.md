# Machine Learning Tutorial

## Create SupervisedDataset

This is a short introduction to train and predict with a machine learning model in safe-DS.

First we need to create a [SupervisedDataset][safeds.data.SupervisedDataset] from the training data.

```python
from safeds.data import SupervisedDataset
from safeds.data.tabular import Table
from safeds.ml.regression import LinearRegression

table = Table({"column1": [3, 4, 8, 6, 5],
               "column2": [2, 2, 1, 6, 3],
               "column3": [1, 1, 1, 1, 1],
               "target": [6, 7, 10, 13, 9]})

to_be_predicted_table = Table({
    "column1": [1, 1, 0, 2, 4],
    "column2": [2, 0, 5, 2, 7],
    "column3": [1, 4, 3, 2, 1]})

sup_dataset = SupervisedDataset(table, target_column="target")
```

[SupervisedDatasets][safeds.data.SupervisedDataset] are used in safe-DS to train supervised machine learning models
(e.g. [RandomForest][safeds.ml.classification.RandomForest] as a classification model or
[LinearRegression][safeds.ml.regression.LinearRegression] as a regression model).
A [SupervisedDataset][safeds.data.SupervisedDataset] can be created by providing a [Table][safeds.data.tabular.Table] and
specifying the target vector (i.e. the part of your training data `table` your model is supposed to learn to predict) from the table.
[SupervisedDatasets][safeds.data.SupervisedDataset]
keep track of the target vector, such as the column `target` in the example above.

## Create and train model

In our code example, we want to predict the sum of a row. The `table` contains the target vector `target` that we want to
train our model to predict. As you can see, per row the column `target` is the sum of the values in the other columns.
The `to_predicted_table` is the table we want to make predictions about, so it
does not contain a target vector.

In order to train the [LinearRegression][safeds.ml.regression.LinearRegression]-model we need to make the following calls
in safe-DS:

```python
linear_reg_model = LinearRegression()
linear_reg_model.fit(sup_dataset)
```

Thus, a [LinearRegression][safeds.ml.regression.LinearRegression]-object is created and trained ("fitted", [`.fit()`][safeds.ml.regression._linear_regression.LinearRegression.fit]) on the
[SupervisedDataset][safeds.data.SupervisedDataset] `sup_data` we created earlier.

In safe-DS, machine learning models are separated into different classes. Each class implements the different fit- and prediction-methods for the given machine learning model.

## Predicting new values

Now that the `linear_reg_model` is a fitted linear regression model, we can call the
[`predict(dataset: SupervisedDataset)`][safeds.ml.regression._linear_regression.LinearRegression.predict]-method
on this model.

```python
prediction = linear_reg_model.predict(dataset=to_be_predicted_table,
                                      target_name="predicted_values")
```

The predict-method takes the data you want to use for predictions as a parameter (`dataset`). In our example,
this is the table `to_be_predicted_table`.
The `target_name`-parameter specifies the name of the column used to store the prediction results.
It is optional, so you do not need to specify it.
If you do not specify the `target_name`, the name of the `target_vector` in the given
[SupervisedDataset][safeds.data.SupervisedDataset] will be used.

## Results

One possible result of our example is the following table:

| column1 | column2 | column3 | target |
| ------- | ------- | ------- | ------ |
| 1       | 2       | 1       | 4.0    |
| 1       | 0       | 4       | 2.0    |
| 0       | 5       | 3       | 6.0    |
| 2       | 2       | 2       | 5.0    |
| 4       | 7       | 1       | 12.0   |

!!! note
    Your target-vector may differ from our result.
