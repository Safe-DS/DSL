import pandas as pd
import pytest

from safe_ds.data import Table


def test_get_max_invalid():
    with pytest.raises(TypeError):
        table = Table(pd.DataFrame(data={"col1": ["col1_1", 2]}))
        column = table.get_column_by_name("col1")
        column.statistics.get_max()


def test_get_max_valid():
    table = Table(pd.DataFrame(data={"col1": [1, 2, 3, 4]}))
    column = table.get_column_by_name("col1")
    assert column.statistics.get_max() == 4
