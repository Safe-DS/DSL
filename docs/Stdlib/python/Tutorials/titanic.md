# Example: Titanic

First we download the dataset from [kaggle](https://www.kaggle.com/c/titanic) and import it into our Jupyter Notebook.
```python
from safe_ds.data import Table
data_train = Table.from_csv("path/to/data/train.csv")
data_test = Table.from_csv("path/to/data/test.csv")
```

Now we can analyze our dataset.
```python
from safe_ds.plotting import plot_correlation_heatmap

display(data_train)  # uses the native Jupyter Notebook display function
data_train.summary()

for column_name in data_train.get_column_names():
    if data_train.get_column(column_name).has_missing_values():
        print(column_name)   # prints 'Age', 'Cabin' and 'Embarked'
```
![Table](./Resources/Table.png)
![Summary](./Resources/Summary.png)

This first step reveals a few useful bits of information.
First of all we notice, that the idness of the column *PassangerId* is 1 which means, that every row has a unique value.
For machine learning this is not useful, so we want to drop it. But since we need the *PassangerId* in the end to submit our result, we will keep it for later and just remove it from our training dataset.

Also not useful are Name and Ticket.

Also there are three columns that contain empty values. In this example application we'll drop Cabin and Embarked and use
the Imputer to fill the missing values in the Age Column with the mean.


[comment]: <> (We should use remove_outliers here, but the method is currently broken)

```python
from safe_ds.data import Imputer

test_passengerId = data_test.get_column("PassengerId")

data_train = data_train.drop_columns(["Name", "Ticket", "Cabin", "Embarked", "PassengerId"])
data_test = data_test.drop_columns(["Name", "Ticket", "Cabin", "Embarked", "PassengerId"])

mean_imputer = Imputer(Imputer.Strategy.Mean())
data_train = mean_imputer.fit_transform(data_train, ["Age"])
data_test = mean_imputer.fit_transform(data_test, ["Age"])

data_train = data_train.drop_duplicate_rows()
```

Now that we have prepared our data we can think about what model to use. For now we'll choose the RandomForestClassifier.
Also we need to prepare our training data. We can create a `SupervisedDataset` and define our target column as "Survived".

```python
from safe_ds.classification import RandomForest
from safe_ds.data import SupervisedDataset

model = RandomForest()
supervised_set = SupervisedDataset(data_train, "Survived")
```

Now we train our model and use it to predict the survivalrate for our test data.

```python
model.fit(supervised_set)
prediction = model.predict(data_test)
```

In the end we can save our result as a .csv file and upload it to kaggle to receive our accuracy rating.
```python
result = Table.from_columns([test_passengerId, prediction])
result.to_csv("path/to/output/result.csv")
```
