import pytest
from safe_ds.data import Table
from safe_ds.exceptions import ColumnNameDuplicateError, ColumnNameError


def test_read_csv_valid():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    assert table._data["A"][0] == 1 and table._data["B"][0] == 2


def test_read_csv_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("tests/resources/test_table_read_csv_invalid.csv")


def test_read_json_valid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    assert table._data["A"][0] == 1 and table._data["B"][0] == 2


def test_read_json_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_json("tests/resources/test_table_read_json_invalid.json")


@pytest.mark.parametrize(
    "name_from, name_to, column_one, column_two",
    [("A", "D", "D", "B"), ("A", "A", "A", "B")],
)
def test_rename_valid(name_from, name_to, column_one, column_two):
    table: Table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    renamed_table = table.rename_column(name_from, name_to)
    assert renamed_table._data.columns[0] == column_one
    assert renamed_table._data.columns[1] == column_two


@pytest.mark.parametrize(
    "name_from, name_to, error",
    [
        ("C", "D", ColumnNameError),
        ("A", "B", ColumnNameDuplicateError),
        ("D", "D", ColumnNameError),
    ],
)
def test_rename_invalid(name_from, name_to, error):
    table: Table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    with pytest.raises(error):
        table.rename_column(name_from, name_to)

def test_table_column_drop():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    transformed_table = table.drop_columns(["A"])
    assert "B" in transformed_table._data.columns and "A" not in transformed_table._data.columns

def test_table_column_keep():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    transformed_table = table.keep_columns(["A"])
    assert "A" in transformed_table._data.columns and "B" not in transformed_table._data.columns

def test_table_column_keep_warning():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    with pytest.raises(ColumnNameError):
        table.keep_columns(["C"])

def test_table_column_drop_warning():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    with pytest.raises(ColumnNameError):
        table.drop_columns(["C"])
