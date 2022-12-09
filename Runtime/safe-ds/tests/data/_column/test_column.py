import pandas as pd
from safe_ds.data import Column, IntColumnType, Table


def test_from_columns():
    column1 = Column(pd.Series([1, 4]), "A", IntColumnType())
    column2 = Column(pd.Series([2, 5]), "B")

    assert column1._type == column2._type


def negative_test_from_columns():
    column1 = Column(pd.Series([1, 4]), "A",None)
    column2 = Column(pd.Series(["2", "5"]), "B", None)

    assert column1._type != column2._type
