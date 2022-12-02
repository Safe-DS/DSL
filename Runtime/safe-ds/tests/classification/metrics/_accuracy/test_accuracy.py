import pandas as pd

from safe_ds.classification.metrics import accuracy
from safe_ds.data import Column, ColumnType


def test_accuracy():
    c1 = Column(pd.Series(data=[1, 2, 3, 4]), "TestColumn1",
                ColumnType.from_numpy_dtype(pd.Series(data=[1, 2, 3, 4]).dtype))
    c2 = Column(pd.Series(data=[1, 2, 3, 3]), "TestColumn2",
                ColumnType.from_numpy_dtype(pd.Series(data=[1, 2, 3, 3]).dtype))
    assert accuracy(c1, c2) == 0.75


def test_accuracy_different_types():
    c1 = Column(pd.Series(data=["1", "2", "3", "4"]), "TestColumn1",
                ColumnType.from_numpy_dtype(pd.Series(data=[1, 2, 3, 4]).dtype))
    c2 = Column(pd.Series(data=[1, 2, 3, 3]), "TestColumn2",
                ColumnType.from_numpy_dtype(pd.Series(data=[1, 2, 3, 3]).dtype))
    assert accuracy(c1, c2) == 0.0
