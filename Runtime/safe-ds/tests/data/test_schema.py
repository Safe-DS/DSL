import numpy as np
import pandas as pd
from pandas import DataFrame

from safe_ds.data import Table, TableSchema


def test_from_table_valid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    df_for_expected: pd.DataFrame = DataFrame([[1, 2]], columns=["A", "B"])
    expected_types = df_for_expected.dtypes.to_list()
    schema_expected = TableSchema(df_for_expected.columns, expected_types)

    assert table.schema == schema_expected


def test_from_table_invalid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    df_for_expected: pd.DataFrame = DataFrame([[1, "2"]], columns=["A", "B"])
    expected_types = df_for_expected.dtypes.to_list()
    schema_not_expected = TableSchema(df_for_expected.columns, expected_types)

    assert table.schema != schema_not_expected


def test_has_column_true():
    table = Table.from_json("tests/resources/test_table_read_json.json")

    assert table.schema.has_column("A")


def test_has_column_false():
    table = Table.from_json("tests/resources/test_table_read_json.json")

    assert not table.schema.has_column("C")


def test_get_type_of_column():
    table = Table.from_json("tests/resources/test_table_read_json.json")

    table_column_type = table.schema.get_type_of_column("A")

    assert table_column_type is np.dtype('int64')
