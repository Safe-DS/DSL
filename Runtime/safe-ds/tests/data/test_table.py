import pytest
from safe_ds.data import Table
from safe_ds.data import Row


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


def test_get_row_by_index():
    table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    val = table.get_row_by_index(0)
    assert val._data['A'].iloc[0] == 1 and val._data['B'].iloc[0] == 2
    with pytest.raises(KeyError):
        table.get_row_by_index(-1)
    with pytest.raises(KeyError):
        table.get_row_by_index(5)


