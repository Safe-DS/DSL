import pandas as pd
import pytest
from safe_ds.data import Column


def test_filter_values_valid() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    result_column: Column = column.filter_values(lambda value: value == 1)
    assert result_column._data.size == 2


def test_filter_values_invalid() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    with pytest.raises(ArithmeticError):
        column.filter_values(lambda x: x / 0)
