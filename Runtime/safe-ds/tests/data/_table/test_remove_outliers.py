import pandas as pd
import pytest
from safe_ds.data import Table
from safe_ds.exceptions import UnknownColumnNameError


def test_remove_outliers() -> None:
    table = Table(
        pd.DataFrame(
            data={
                #"col1": ["A", "B", "C"],
                "col3": [1., 2., 3.],
                "col4": [2, 3, 1],
            }
        )
    )
#todo test if values are missing
    print(table.remove_outliers()._data)

    assert 1 == 0
