import pandas as pd

from safe_ds.data._table import Table


def test_get_column_by_name_valid():
    table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
    assert table.get_column_by_name("col1") == pd.Series(data={"col1_1"}) and table.get_column_by_name(
        "col2") == pd.Series(data={"col2_1"})
import pytest

from  import Table


def test_read_csv_valid():
    table = Table.from_csv("test_table_read_csv.csv")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_csv_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("test_table_read_csv_invalid.csv")


def test_read_json_valid():
    table = Table.from_csv("test_table_read_json.json")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_json_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("test_table_read_json_invalid.json")
