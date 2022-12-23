import pandas as pd
import pytest

from safe_ds.data import LabelEncoder, Table
from safe_ds.exceptions import NotFittedError


def test_transform_valid() -> None:
    test_table = Table(pd.DataFrame({"citys": ["paris", "paris", "tokyo", "amsterdam"]}))
    le = LabelEncoder()
    le.fit(test_table, "citys")
    test_table = le.transform(test_table, "citys")
    assert test_table.schema.has_column("citys")
    assert test_table.to_columns()[0].get_value(0) == 1
    assert test_table.to_columns()[0].get_value(2) == 2
    assert test_table.to_columns()[0].get_value(3) == 0


def test_transform_invalid() -> None:
    test_table = Table(pd.DataFrame({"citys": ["paris", "paris", "tokyo", "amsterdam"]}))
    le = LabelEncoder()
    # le.fit(test_table) removed to force NotFittedError
    with pytest.raises(NotFittedError):
        le.transform(test_table, "citys")
