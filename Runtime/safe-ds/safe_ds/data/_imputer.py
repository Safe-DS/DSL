from __future__ import annotations
from ._table import Table
import pandas as pd

from sklearn.impute import SimpleImputer
import numpy as np
from typing import Any


# noinspection PyProtectedMember
class Imputer:
    """
    Imputes the Data for a given Table

    it is also needed to apply a strategy before imputing

    Parameters
    ----------
    strategy: Imputer.Strategy
        The strategy to impute missing values
    """

    class Strategy:
        def __init__(self, _imp: SimpleImputer):
            self._imp = _imp

        @staticmethod
        def Mean() -> Imputer.Strategy:
            """

            Returns
            -------
                An Imputer-Strategy for imputing the missing data with mean values
            """
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='mean'))

        @staticmethod
        def Mode() -> Imputer.Strategy:
            """

            Returns
            -------
                An Imputer-Strategy for imputing the missing data with mode values
            """
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='most_frequent'))

        @staticmethod
        def Median() -> Imputer.Strategy:
            """

            Returns
            -------
                An Imputer-Strategy for imputing the missing data with median values
            """
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='median'))

        @staticmethod
        def Constant(value: Any) -> Imputer.Strategy:
            """
            Parameters
            ----------
            value
                The given values to impute missing values

            Returns
            -------
                An Imputer-Strategy for imputing the missing data with given constant values
            """
            return Imputer.Strategy(SimpleImputer(missing_values=np.nan, strategy='constant', fill_value=value))

    def __init__(self, strategy: Imputer.Strategy):
        self._imp = strategy._imp

    def fit(self, table: Table) -> None:
        """
        Fit the imputer on the given dataset.

        Parameters
        ----------
        table: Table
            the table to learn the new value to impute
        """
        self._imp.fit(table._data)

    def transform(self, table: Table) -> Table:
        """
        Impute the missing values on the given dataset

        Parameters
        ----------
        table: Table
            the dataset to be imputed

        Returns
        -------
        table : Table
            a dataset that is equal to the given dataset, with missing values imputed to the given strategy
        """
        names = table._data.columns
        return Table(pd.DataFrame(self._imp.transform(table._data), columns=names))

    def fit_transform(self, table: Table) -> Table:
        """
        Fit the imputer on the given dataset and impute the missing values

        Parameters
        ----------
        table: Table
            the dataset to learn the new value to impute and to actually impute

        Returns
        -------
        table : Table
            a dataset that is equal to the given dataset, with missing values imputed to the given strategy
        """
        self._imp.fit(table._data)
        names = table._data.columns
        return Table(pd.DataFrame(self._imp.transform(table._data), columns=names))
