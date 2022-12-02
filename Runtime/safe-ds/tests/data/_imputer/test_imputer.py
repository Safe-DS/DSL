import numpy as np
from safe_ds.data import Table, Imputer
import pandas as pd


def test_imputer_mean():
    table = Table(pd.DataFrame(data={"col1": [np.nan, 2, 3, 4, 5]}))
    column = table.get_column_by_name("col1")
    imp = Imputer(Imputer.Strategy.Mean())
    new_table = imp.fit_transform(table)

    assert new_table.get_column_by_name("col1")._data[0] == column.statistics.mean()


def test_imputer_median():
    table = Table(pd.DataFrame(data={"col1": [np.nan, 2, 3, 4, 5]}))
    column = table.get_column_by_name("col1")
    imp = Imputer(Imputer.Strategy.Median())
    new_table = imp.fit_transform(table)

    assert new_table.get_column_by_name("col1")._data[0] == column.statistics.median()


def test_imputer_mode():
    table = Table(pd.DataFrame(data={"col1": [np.nan, 2, 3, 4, 5]}))
    column = table.get_column_by_name("col1")
    imp = Imputer(Imputer.Strategy.Mode())
    new_table = imp.fit_transform(table)

    assert new_table.get_column_by_name("col1")._data[0] == column.statistics.mode()


def test_imputer_constant():
    table = Table(pd.DataFrame(data={"col1": [np.nan, 2, 3, 4, 5]}))
    column = table.get_column_by_name("col1")
    imp = Imputer(Imputer.Strategy.Constant(0))
    new_table = imp.fit_transform(table)

    assert new_table.get_column_by_name("col1")._data[0] == 0
