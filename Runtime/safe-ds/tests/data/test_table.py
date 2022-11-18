import os

import pandas as pd
import pytest

from safe_ds.data import Table


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


def test_write_and_read_json_valid():
    table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
    if os.path.isfile("tests/resources/test_table_write_and_read_valid.json"):
        os.remove("tests/resources/test_table_write_and_read_valid.json")
    table.to_json("tests/resources/test_table_write_and_read_valid.json")
    table_r = Table.from_json("tests/resources/test_table_write_and_read_valid.json")
    assert table._data.equals(table_r._data)


def test_write_and_read_csv_valid():
    table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
    if os.path.isfile("tests/resources/test_table_write_and_read_valid.csv"):
        os.remove("tests/resources/test_table_write_and_read_valid.csv")
    table.to_csv("tests/resources/test_table_write_and_read_valid.csv")
    table_r = Table.from_csv("tests/resources/test_table_write_and_read_valid.csv")
    assert table._data.equals(table_r._data)
