import pytest
from safe_ds.data._table import Table


def test_read_csv_valid():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_csv_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_csv("tests/resources/test_table_read_csv_invalid.csv")


def test_read_json_valid():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    assert table.data["A"][0] == 1 and table.data["B"][0] == 2


def test_read_json_invalid():
    with pytest.raises(FileNotFoundError):
        Table.from_json("tests/resources/test_table_read_json_invalid.json")
