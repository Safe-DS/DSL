import numpy as np
import pandas as pd
from safe_ds.data import Column, ColumnType, Table


def test_to_columns():
    table = Table.from_csv("tests/resources/test_column_table.csv")

    columns_expected: list[Column] = [
        Column(pd.Series([1, 4]), "A", ColumnType.from_numpy_dtype(np.dtype("int64"))),
        Column(pd.Series([2, 5]), "B", ColumnType.from_numpy_dtype(np.dtype("int64"))),
    ]

    columns_list: list[Column] = table.to_columns()

    for column_table, column_expected in zip(columns_list, columns_expected):
        assert column_table._data.equals(column_expected._data)
