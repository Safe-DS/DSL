import pandas as pd
import pytest

from safe_ds.data import Column, ColumnType
from safe_ds.regression.metrics import mean_squared_error


@pytest.mark.parametrize(
    "actual, expected, result",
    [
        ([1, 2], [1, 2], 0),
        ([0, 0], [1, 1], 1),
        ([1, 1, 1], [2, 2, 11], 34)
    ]
)
def test_mean_squared_error_valid(actual: list[float], expected: list[float], result: float):
    actual = Column(pd.Series([actual]), "actual", ColumnType.from_numpy_dtype(pd.Series([actual]).dtype))
    expected = Column(pd.Series([actual]), "expected", ColumnType.from_numpy_dtype(pd.Series([expected]).dtype))
    assert mean_squared_error(actual, expected) == result


@pytest.mark.parametrize(
    "actual, expected, error",
    [(["A", "B"], [1, 2], TypeError), ([1, 2], ["A", "B"], TypeError), ([1, 2, 3], [1, 2], ColumnLengthMismatchError)],
)
def test_mean_squared_error_invalid(actual, expected, error):
    actual = Column(pd.Series([actual]), "actual", ColumnType.from_numpy_dtype(pd.Series([actual]).dtype))
    expected = Column(pd.Series([actual]), "expected", ColumnType.from_numpy_dtype(pd.Series([expected]).dtype))
    with pytest.raises(error):
        mean_squared_error(actual, expected)
