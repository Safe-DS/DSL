import numpy as np
import pandas as pd
from safe_ds.data import Table

def test_count_null_values_valid():
    table = Table(pd.DataFrame(data={"col1": [1, 2, 3, 4, 5], "col2": [None, None, 1, np.nan, np.nan]}))
    empty_table = Table(pd.DataFrame(data={"col1": []}))
    column1 = table.get_column_by_name("col1")
    column2 = table.get_column_by_name("col2")
    empty_column = empty_table.get_column_by_name("col1")
    assert (
        column1.count_null_values() == 0
        and column2.count_null_values() == 4
        and empty_column.count_null_values() == 0
    )
