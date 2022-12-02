from __future__ import annotations

import pandas as pd
from safe_ds.exceptions import IndexOutOfBoundsError
from safe_ds.exceptions._data_exceptions import ColumnSizeError
from ._column_type import ColumnType


class Column:
    def __init__(self, data: pd.Series, name: str, column_type: ColumnType):
        self._data: pd.Series = data
        self.name: str = name
        self.type: ColumnType = column_type

    def get_value_by_position(self, index: int):
        """
        Returns column value at specified index, starting at 0.

        Parameters
        ----------
        index : int
            Index of requested element as integer.

        Returns
        -------
        value
            Value at index in column.

        Raises
        ------
        IndexOutOfBoundsError
            If the given index does not exist in the column.
        """
        if index < 0 or index >= self._data.size:
            raise IndexOutOfBoundsError(index)

        return self._data[index]

    def idness(self) -> float:
        """
        Calculates the idness of this column (number of unique values / number of rows).

        Returns
        -------
        idness: float
            The idness of the column
        """
        if self._data.size == 0:
            raise ColumnSizeError("> 0", "0")
        return self._data.nunique() / self._data.size

    @property
    def statistics(self) -> ColumnStatistics:
        return ColumnStatistics(self)


class ColumnStatistics:

    def __init__(self, column: Column):
        self.column = column

    def get_max(self):
        """
        Returns the maximum value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        max:
            the maximum value
        """
        if (
            not self.column.type.is_numeric()
        ):
            raise TypeError("The column contains non numerical data.")
        return self.column._data.max()

    def get_min(self):
        """
        Returns the minimum value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        min:
            the minimum value
        """
        if (
            not self.column.type.is_numeric()
        ):
            raise TypeError("The column contains non numerical data.")
        return self.column._data.min()

    def get_mean(self):
        """
        Returns the mean value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        mean:
            the mean value
        """
        if (
            not self.column.type.is_numeric()
        ):
            raise TypeError("The column contains non numerical data.")
        return self.column._data.mean()

    def get_mode(self):
        """
        Returns the mode of the column.

        Returns
        -------
        mode:
            the mode
        """
        return self.column._data.mode()[0]

    def get_median(self):
        """
        Returns the median value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        median:
            the median value
        """
        if (
            not self.column.type.is_numeric()
        ):
            raise TypeError("The column contains non numerical data.")
        return self.column._data.median()
