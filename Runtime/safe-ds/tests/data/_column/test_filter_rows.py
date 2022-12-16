import pandas as pd
import pytest
from safe_ds.data import Column


def test_filter_values_valid() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    result_column: Column = column._filter_values(lambda value: value == 1)
    assert result_column._data.size == 2


def test_filter_values_invalid() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    with pytest.raises(ArithmeticError):
        column._filter_values(lambda x: x / 0)


def test_column_property_all_positive() -> None:
    column = Column(pd.Series([1, 1, 1]), "col1")
    assert column.all(lambda value: value == 1)


def test_column_property_all_negative() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    assert not column.all(lambda value: value == 1)


def test_column_property_any_positive() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    assert column.any(lambda value: value == 1)


def test_column_property_any_negative() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    assert not column.any(lambda value: value == 3)


def test_column_property_none_positive() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    assert column.none(lambda value: value == 3)


def test_column_property_none_negative() -> None:
    column = Column(pd.Series([1, 2, 1]), "col1")
    assert not column.none(lambda value: value == 1)
