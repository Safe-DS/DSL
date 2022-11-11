import pytest
from safe_ds.exceptions import ColumnNameError
from safe_ds.exceptions import ColumnNameDuplicateError
from safe_ds.data import Table


def test_read_csv_valid():
    table = Table.from_csv("tests/data/test_table_read_csv.csv")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_csv_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("tests/data/test_table_read_csv_invalid.csv")


def test_read_json_valid():
    table = Table.from_csv("tests/data/test_table_read_json.json")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_json_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("tests/data/test_table_read_json_invalid.json")


def test_rename_invalid_old_name():
    table: Table = Table.from_csv("tests/data/test_table_read_csv.csv")
    with pytest.raises(ColumnNameError):
        table.rename_column("C", "D")


def test_rename_invalid_new_name():
    table: Table = Table.from_csv("tests/data/test_table_read_csv.csv")
    with pytest.raises(ColumnNameDuplicateError):
        table.rename_column("A", "B")


def test_rename_valid():
    table: Table = Table.from_csv("tests/data/test_table_read_csv.csv").rename_column("A", "D")
    assert table.data.columns[0] == "D" and table.data.columns[1] == "B"
