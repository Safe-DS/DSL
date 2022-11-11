import pandas as pd

from safe_ds.data._table import Table


def test_get_column_by_name_valid():
    table = Table(pd.DataFrame(data={'col1': ["col1_1"], 'col2': ["col2_1"]}))
    assert table.get_column_by_name("col1") == pd.Series(data={"col1_1"}) and table.get_column_by_name(
        "col2") == pd.Series(data={"col2_1"})
