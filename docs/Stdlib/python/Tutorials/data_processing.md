# How to process your data

## Load or create a Table

First we need data to work with. There are different ways to create the data.
The data will be stored in a [Table][safeds.data.tabular.Table], a [Row][safeds.data.tabular.Row] or a [Column][safeds.data.tabular.Column].

A Table can be created with python Iterables or you can load [csv][safeds.data.tabular.Table.from_csv] or [json][safeds.data.tabular.Table.from_json] files into a Table.

```python
from safeds.data.tabular import Table

table = Table({"column1": [3, 4, 8, 6, 5],
               "column2": [2, 2, 1, 6, 3],
               "column3": [1, 1, 1, 1, 1]})

table_from_csv = Table.from_csv("path/to/your/csv/file.csv")

table_from_json = Table.from_json("path/to/your/json/file.json")
```

This table produces the following output:

| column1 | column2 | column3 |
| ------- | ------- | ------- |
| 3       | 2       | 1       |
| 4       | 2       | 1       |
| 8       | 1       | 1       |
| 6       | 6       | 1       |
| 5       | 3       | 1       |

## Create Rows and Columns

Columns and rows can be created with python Iterables or extracted from an existing table.

If we want to create a Row we have to provide a [TableSchema][safeds.data.tabular.typing.TableSchema]. This TableSchema contains information about the columns, which data they are storing and which order they have.
The TableSchema takes a dictionary as input with the names of the columns as keys and their [ColumnTypes][safeds.data.tabular.typing.ColumnType] as values.

A Table contains a TableSchema as well, which is created when creating a Table.

```python
from safeds.data.tabular import Column, Row
from safeds.data.tabular.typing import TableSchema, IntColumnType

new_column = Column([1, 2, 3, 4, 5], "NewColumn")

new_row = Row([1, 2, 3], TableSchema(
    {
        "column1": IntColumnType(),
        "column2": IntColumnType(),
        "column3": IntColumnType()
    }
))

existing_column = table.get_column("column2")

existing_row = table.get_row(2)
```

You can also create a Table from a list of [Rows][safeds.data.tabular.Table.from_rows] or [Columns][safeds.data.tabular.Table.from_columns] and get a list of [Rows][safeds.data.tabular.Table.to_rows] or [Columns][safeds.data.tabular.Table.to_columns] from an existing Table.

```python
rows = table.to_rows()
columns = table.to_columns()

rows.append(new_row)
table_new_row = Table.from_rows(rows)

columns.append(new_column)
table_new_column = Table.from_columns(columns)
```

The output of table_new_row is:

| column1 | column2 | column3 |
| ------- | ------- | ------- |
| 3       | 2       | 1       |
| 4       | 2       | 1       |
| 8       | 1       | 1       |
| 6       | 6       | 1       |
| 5       | 3       | 1       |
| 1       | 2       | 3       |

And the output of table_new_column is:

| column1 | column2 | column3 | NewColumn |
| ------- | ------- | ------- | --------- |
| 3       | 2       | 1       | 1         |
| 4       | 2       | 1       | 2         |
| 8       | 1       | 1       | 3         |
| 6       | 6       | 1       | 4         |
| 5       | 3       | 1       | 5         |

## Add Rows and Columns to a Table

You might think this is a very laborious approach to add a column or a row to a Table. You can also add a new [Column][safeds.data.tabular.Table.add_column] or [Row][safeds.data.tabular.Table.add_row] to an existing Table.

```python
table_new_row_2 = table.add_row(new_row)

table_new_column_2 = table.add_column(new_column)
```

## Drop and Keep Columns from a Table

The outputs are the same tables you created in the example above.

Sometimes it might be useful to remove some columns. Therefore, you can create a new table which will either [keep][safeds.data.tabular.Table.keep_columns] or [drop][safeds.data.tabular.Table.drop_columns] some columns from the original table.

```python
table_without_column_1 = table.drop_columns(["column1"])

table_with_only_column_1_and_2 = table.keep_columns(["column1", "column2"])
```

First column1 is dropped. This leaves a new Table containing column2 and column3:

| column2 | column3 |
| ------- | ------- |
| 2       | 1       |
| 2       | 1       |
| 1       | 1       |
| 6       | 1       |
| 3       | 1       |

In the second example a new Table is created by keeping only column1 and column2:

| column1 | column2 |
| ------- | ------- |
| 3       | 2       |
| 4       | 2       |
| 8       | 1       |
| 6       | 6       |
| 5       | 3       |

## Imputing missing values

If your data is missing values, it might be challanging for some machine learning models.
The [Imputer][safeds.data.tabular.transformation.Imputer] can be used to deal with these values.
An Imputer needs a [Strategy][safeds.data.tabular.transformation.Imputer.Strategy] which can either be to replace the missing value with a [Constant][safeds.data.tabular.transformation.Imputer.Strategy.Constant], or the [Mean][safeds.data.tabular.transformation.Imputer.Strategy.Mean], [Mode][safeds.data.tabular.transformation.Imputer.Strategy.Mode] or [Median][safeds.data.tabular.transformation.Imputer.Strategy.Median] of the Column.

```python
from safeds.data.tabular.transformation import Imputer

table_with_nan = Table({"column1": [None, 4, 8, None, 5],
                        "column2": [2, 2, 1, 6, 3],
                        "column3": [1, 1, 1, 1, 1]})

imputer = Imputer(Imputer.Strategy.Median())
table2_imp = imputer.fit_transform(table_with_nan, ["column1"])
```

The `nan` values in the following table are replaced with the median value of column1:

| column1 | column2 | column3 |
| ------- | ------- | ------- |
| 5.0     | 2.0     | 1.0     |
| 4.0     | 2.0     | 1.0     |
| 8.0     | 1.0     | 1.0     |
| 5.0     | 6.0     | 1.0     |
| 5.0     | 3.0     | 1.0     |

## Dealing with strings as data

In the following three examples we will use a new Table with strings:

```python
table_with_strings = Table({"column1": ["January", "March", "April", "March", "December"],
                            "column2": ["Class1", "Class1", "Class2", "Class2", "Class1"]})
```

| column1 | column2 |
| ------- | ------- |
| January | Class1  |
| March   | Class1  |
| April   | Class2  |
| March   | Class2  |
| December | Class1  |

### Using a LabelEncoder to deal with strings in a column

A [LabelEncoder][safeds.data.tabular.transformation.LabelEncoder] can be used to replace the string values with integer values. The integer values are sorted by the alphabetical order of the strings.

```python
from safeds.data.tabular.transformation import LabelEncoder

label_encoder = LabelEncoder()
table_label_encoded = label_encoder.fit_transform(table_with_strings, ["column1", "column2"])
```

| column1 | column2 |
| ------- | ------- |
| 2       | 0       |
| 3       | 0       |
| 0       | 1       |
| 3       | 1       |
| 1       | 0       |

### Using a OneHotEncoder to deal with strings in a column

Another method to deal with strings in your data is the [OneHotEncoder][safeds.data.tabular.transformation.OneHotEncoder]. This encoder adds a new Column for each different value with a 1, if this value is selected and a 0 otherwise.

```python
from safeds.data.tabular.transformation import OneHotEncoder

one_hot_encoder = OneHotEncoder()
table_one_hot_encoded = one_hot_encoder.fit_transform(table_with_strings, ["column1", "column2"])
```

| column1_April | column1_December | column1_January | column1_March | column2_Class1 | column2_Class2 |
| ------------- | ---------------- | --------------- | ------------- | -------------- | -------------- |
| 0.0           | 0.0              | 1.0             | 0.0           | 1.0            | 0.0            |
| 0.0           | 0.0              | 0.0             | 1.0           | 1.0            | 0.0            |
| 1.0           | 0.0              | 0.0             | 0.0           | 0.0            | 1.0            |
| 0.0           | 0.0              | 0.0             | 1.0           | 0.0            | 1.0            |
| 0.0           | 1.0              | 0.0             | 0.0           | 1.0            | 0.0            |

### Using an OrdinalEncoder to deal with strings in a column

The third method to deal with strings in your data is the [OrdinalEncoder][safeds.data.tabular.transformation.OrdinalEncoder]. This encoder works like the label encoder but keeps the order of the encoded values. This order has to be provided when creating the encoder.

```python
from safeds.data.tabular.transformation import OrdinalEncoder

ordinal_encoder_months = OrdinalEncoder(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
table_months_ordinal_encoded = ordinal_encoder_months.fit_transform(table_with_strings, ["column1"])

ordinal_encoder_calsses = OrdinalEncoder(["Class1", "Class2"])
table_months_and_classes_ordinal_encoded = ordinal_encoder_calsses.fit_transform(table_months_ordinal_encoded, ["column2"])
```

| column1 | column2 |
| ------- | ------- |
| 0       | 0       |
| 2       | 0       |
| 3       | 1       |
| 2       | 1       |
| 11      | 0       |

## Statistics of a Column

To drop or keep certain columns it might be useful to evaluate which columns are important enough to keep and which columns can be dropped.
For this you can use the statistics of a Column.
The [ColumnStatistics][safeds.data.tabular.ColumnStatistics] class provides multiple functions like [`min`][safeds.data.tabular.ColumnStatistics.min], [`max`][safeds.data.tabular.ColumnStatistics.max], [`mode`][safeds.data.tabular.ColumnStatistics.mode], [`mean`][safeds.data.tabular.ColumnStatistics.mean], [`median`][safeds.data.tabular.ColumnStatistics.median] and others.

If you want a summary over all the columns you can use the [`summary`][safeds.data.tabular.Table.summary] function which provides a table containing the statistics for each column.

```python
table.summary()
```

| metrics | column1 | column2 | column3 |
| ------- | ------- | ------- | ------- |
| max     | 8       | 6       | 1       |
| min     | 3       | 1       | 1       |
| mean    | 5.2     | 2.8     | 1.0     |
| mode    | 3       | 2       | 1       |
| median  | 5.0     | 2.0     | 1.0     |
| sum     | 26      | 14      | 5       |
| variance | 3.7000000000000006 | 3.7000000000000006 | 0.0     |
| standard deviation | 1.9235384061671346 | 1.9235384061671346 | 0.0     |
| idness  | 1.0     | 0.8     | 0.2     |
| stability | 0.2     | 0.4     | 1.0     |
| row count | 5       | 5       | 5       |

## Sort the Columns in a table

If you want to print or save your Table it might be useful to rearrange some Columns. For that you can use the [`sort_columns`][safeds.data.tabular.Table.sort_columns] function.
This function uses a user given query to sort the Columns and provides a new Table which is sorted. If you do not provide a query, the Table will be sorted in alphabetical order.
In the following example we use a query to sort the Columns by ascending sum.

```python
table_ascending_sum = table.sort_columns(
    lambda column1, column2: column1.statistics.sum() - column2.statistics.sum())
```

The table_ascending_sum has the following output:

| column3 | column2 | column1 |
| ------- | ------- | ------- |
| 1       | 2       | 3       |
| 1       | 2       | 4       |
| 1       | 1       | 8       |
| 1       | 6       | 6       |
| 1       | 3       | 5       |

## Filter Rows in a table

Similar to the `sort_columns` function works the [`filter_rows`][safeds.data.tabular.Table.filter_rows] function. You provide a query which returns `1`, if the Row should be kept in the Table.
In this example we will keep all Rows whose sum is an even number.

```python
table_only_even_sums = table.filter_rows(
    lambda row:
        (row.get_value("column1") + row.get_value("column2") + row.get_value("column3") + 1) % 2)
```

This outputs the following Table:

| column1 | column2 | column3 |
| ------- | ------- | ------- |
| 3       | 2       | 1       |
| 8       | 1       | 1       |

## Write a Table into a csv or json file

If you finished your work with the data you might want to store the result in a file.
You can write the data into a csv or a json file with the methods [`to_csv`][safeds.data.tabular.Table.to_csv] and [`to_json`][safeds.data.tabular.Table.to_json].

```python
table.to_csv("path/to/your/csv/output/file.csv")

table.to_json("path/to/your/json/output/file.json")
```
