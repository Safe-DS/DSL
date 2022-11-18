import pytest
from safe_ds.exceptions import ColumnNameDuplicateError, ColumnNameError
import pandas as pd

from safe_ds.data import Column
from safe_ds.data import Table


def test_read_csv_valid():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    assert table._data["A"][0] == 1 and table._data["B"][0] == 2


def test_get_column_by_name_valid():
    table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
    assert isinstance(table.get_column_by_name("col1"), Column) and table.get_column_by_name("col1").data[0] == \
           pd.Series(
               data=["col1_1"])[0] and table.get_column_by_name("col1").data[0] == "col1_1"


def test_get_column_by_name_invalid():
    with pytest.raises(ColumnNameError):
        table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
        table.get_column_by_name("col3")


def test_read_csv_valid():
    table = Table.from_csv("test_table_read_csv.csv")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


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
