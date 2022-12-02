from __future__ import annotations
from safe_ds.data import Table
import pandas as pd

from sklearn.impute import SimpleImputer
import numpy as np
from enum import Enum


# noinspection PyProtectedMember
class Imputer:

    class Strategy:
        def __init__(self, _imp: SimpleImputer):
            self._imp = _imp


        @staticmethod
        def Mean():
            """

            Returns
            -------

            """
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='mean'))


        @staticmethod
        def Mode():
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='most_frequent'))


        @staticmethod
        def Median():
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='median'))

        @staticmethod
        def Constant(val):
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='constant', fill_value=val))

    def __init__(self, strat : Imputer.Strategy):
        self._imp = strat._imp

    def fit(self, table : Table):
        self._imp.fit(table._data)


    def transform(self, table: Table) -> Table:
        names = table._data.columns
        return Table(pd.DataFrame(self._imp.transform(table._data),columns=names))

    def fit_transform(self, table: Table) -> Table:
        self._imp.fit(table._data)
        names = table._data.columns
        return  Table(pd.DataFrame(self._imp.transform(table._data),columns=names))



