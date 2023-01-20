import pandas as pd
from _pytest.python_api import raises
from safe_ds.data import IntColumnType, Row, StringColumnType, Table, TableSchema
from safe_ds.exceptions import SchemaMismatchError


def test_get_column_names() -> None:
    table = Table(pd.DataFrame(data={"col1": [1], "col2": [1]}))
    assert table.get_column_names() == ["col1", "col2"]


def test_get_column_names_empty() -> None:
    table = Table(pd.DataFrame())
    assert table.get_column_names() == []
