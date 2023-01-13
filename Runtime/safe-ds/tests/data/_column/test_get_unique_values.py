import pandas as pd
import pytest
from safe_ds.data import Column, Table


@pytest.mark.parametrize(
    "values, unique_values",
    [
        ([1, 1, 2, 3], [1, 2, 3]),
        (["a", "b", "b", "c"], ["a", "b", "c"]),
        ([], [])
    ],
)
def test_get_unique_values(values: list[any], unique_values: list[any]) -> None:
    column: Column = Column(values, "")
    extracted_unique_values: list[any] = column.get_unique_value()

    assert extracted_unique_values == unique_values
