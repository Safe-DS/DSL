# How to process your data

1. Load data in to a table

    ```python
    # read a csv file
    table_csv = Table.from_csv("path_to_csv_file.csv")

    # or a json file
    table_json = Table.from_json("path_to_json_file.json")
    ```

1. Extract a row from a table

    ```python
    # provide the index of the row
    row = table.get_row(0)
    ```

1. Extract a column from a table

    ```python
    # provide the name of the column
    column = table.get_column("TheColumnName")
    ```

1. Combine a list of rows to a table

    ```python
    # make sure the rows have the same columns
    table = Table.from_rows([row1, row2])
    ```

1. Combine a list of columns to a table

    ```python
    # make sure the columns have the same amount of rows
    table = Table.from_columns([column1, column2])
    ```

1. Drop columns from a table or keep only specified columns in a table

    ```python
    # drop specified columns
    table = table.drop_columns(["NameOfColumn1", "NameOfColumn2"])

    # keep specified columns
    table = table.keep_columns(["NameOfColumn1", "NameOfColumn2"])
    ```

1. Sort columns with a given query

    ```python
    # returns a new table with sorted columns in a reversed alphabetical order
    table = table.sort_columns(
        lambda column1, column2:
            (column1.name < column2.name) - (column1.name > column2.name))

    # if no lambda is provided, the columns will be sorted alphabetically
    table = table.sort_columns()
    ```

1. Filter rows with a given query

    ```python
    # returns a new table where each row has the value 1 in the column "NameOfColumn1"
    table = table.filter_rows(lambda row: row.get_value("NameOfColumn1") == 1)
    ```

1. Write data to a CSV or JSON file

    ```python
    # write to a .csv-file
    table.to_csv("path_to_csv_output_file.csv")

    # write to a .json-file
    table.to_json("path_to_json_output_file.json")
    ```
