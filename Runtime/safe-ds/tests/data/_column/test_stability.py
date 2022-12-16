import typing

import pandas as pd
import pytest

from safe_ds.data import Column


@pytest.mark.parametrize(
    "values, expected",
    [
        ([1, 2, 3, 4, None], 1 / 4),
        ([1, 1, 3, "abc", None], 2 / 4),
        (["b", "a", "abc", "abc", "abc"], 3 / 5),
    ],
)
def test_table_add_column_valid(values: list[typing.Any], expected: float) -> None:
    column = Column(pd.Series(values), "A")
    assert column.stability() == expected
