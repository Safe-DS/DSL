# Machine Learning Tutorial

Here is a short introduction to train and predict with a machine learning model in safe-ds.

First we need to create a SupervisedDataset from the training data.

```python
from safe_ds.data import Table, SupervisedDataset
from safe_ds.regression import LinearRegression

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

SupervisedDatasets are used in safe-DS to train supervised machine learning models, because they keep track of the target
vector. A SupervisedDataset can be created from a table and specifying the target vector in the table.

In this code example, we want to predict the sum of a row. The `table` contains the target vector we want to
train with (the sum of the rows). The `to_predicted_table` is the table we want to make predictions with, so it
does not contain a target vector.

In order to train the `LinearRegression`-model we need to make the following calls in safe-DS.

```python
linear_reg_model = LinearRegression()
linear_reg_model.fit(sup_dataset)
```

As we can see, a `LinearRegression`-object is created.

In safe-DS machine learning models are separated in different classes where the different fit and predictions methods
are implemented for the given machine learning model.

So in order to train a linear regression model we create a `LinearRegression`-object and call then the `.fit()`
-method on this object. Now the `linear_reg_model` is a fitted linear regression model, and we can call
the `predict(dataset = SupervisedDataset)`-method on this model.

```python
prediction = linear_reg_model.predict(dataset=to_be_predicted_table,
                                      target_name="predicted_values")
```

After we trained the `linear_reg_model`-object we can make predictions with the model. To do this we call the
`predict(dataset = Table, target_name = Optional[str])`-method on the trained model. The `target_name`-parameter
is optional, so you do not need to specify it. If you do not specify the `target_name`, the name of
the `target_vector` in the given `SupervisedDataset`will be used.

So for the call above we will get the following output:

| column1 | column2 | column3 | target |
| ------- | ------- | ------- | ------ |
| 1       | 2       | 1       | 4.0    |
| 1       | 0       | 4       | 2.0    |
| 0       | 5       | 3       | 6.0    |
| 2       | 2       | 2       | 5.0    |
| 4       | 7       | 1       | 12.0   |

Note: your target-vector may differ from our result
