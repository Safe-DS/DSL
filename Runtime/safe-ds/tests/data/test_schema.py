import numpy as np
from safe_ds.data import Table, TableSchema, ColumnType

def test_from_table_valid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    schema_expected = TableSchema(["A", "B"], [ColumnType.from_numpy_dtype(np.dtype("int64")), ColumnType.from_numpy_dtype(np.dtype("int64"))])

    assert table.schema == schema_expected


def test_from_table_invalid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    schema_not_expected = TableSchema(["A", "C"],[ColumnType.from_numpy_dtype(np.dtype("f8")), ColumnType.from_numpy_dtype(np.dtype("int64"))])

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

    assert table_column_type == ColumnType.from_numpy_dtype(np.dtype("int64"))
