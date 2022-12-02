import numpy as np
import pandas as pd

from safe_ds.data import Table, TableSchema, Row

table = Table.from_json("../tests/resources/test_schema_table.json")
rows_is: list[Row] = table.to_rows()
table_is: Table = Table.from_rows(rows_is)

print(table._data)
print("\n")
print(table_is._data)
print("\n")
for (index, series_row) in table._data.iterrows():
    print(series_row)
print("\n")
for row in rows_is:
    print(row._data)
