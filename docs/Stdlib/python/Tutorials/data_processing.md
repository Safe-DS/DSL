# How to process your data

1. Load your data in to a table

```python
# via a csv file
table_csv = Table.from_csv("path_to_csv_file.csv")

# or a json file
table_json = Table.from_json("path_to_json_file.json")
```

2. Extract a row from your table

```python
# provide the index of the row
row = table.get_row(0)
```

3. Extract a column from your table

```python
# provide the name of the column
column = table.get_column("TheColumnName")
```

4. Combine a list of rows to a Table

```python
# make sure the rows have the same Columns
table = Table.from_rows([row1, row2])
```

5. Combine a list of columns to a Table

```python
# make sure the columns have the same amount of rows
table = Table.from_columns([column1, column2])
```

6. Drop or keep Columns in a Table

```python
# drop specified columns
table = table.drop_columns(["NameOfColumn1", "NameOfColumn2"])

# keep specified columns
table = table.keep_columns(["NameOfColumn1", "NameOfColumn2"])
```

7. Sort your columns with a given query

```python
# returns a new table with sorted columns in a reversed alphabetical order
table = table.sort_columns(
    lambda column1, column2:
        (column1.name < column2.name) - (column1.name > column2.name))

# if you do not provide a lambda the columns will be sorted alphabetically
table = table.sort_columns()
```

8. Filter rows with a given query

```python
# returns a new table where each row has the value 1 in the column with the name "NameOfColumn1"
table = table.filter_rows(lambda row: row.get_value("NameOfColumn1") == 1)
```

9. Write the data to a csv or json file

```python
# write to a csv file
table.to_csv("path_to_csv_output_file.csv")

# write to a json file
table.to_json("path_to_json_output_file.json")
```
