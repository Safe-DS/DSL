import numpy as np
import pandas as pd

from safe_ds.exceptions import IndexOutOfBoundsError


class Column:
    def __init__(self, data: pd.Series, name: str, column_type: np.dtype):
        self._data: pd.Series = data
        self.name: str = name
        self.type: np.dtype = column_type

    def get_value_by_position(self, index: int):
        """Returns column value at specified index, starting at 0.

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

    def get_max(self):
        """
        Returns the maximum value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        max:
            the maximum value
        """
        if (
            not isinstance(self.type, int)
            and not isinstance(self.type, float)
        ):
            raise TypeError("The column contains non numerical data.")
        return self._data.max()

    def get_min(self):
        """
        Returns the minimum value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        min:
            the minimum value
        """
        if (
            not isinstance(self.type, int)
            and not isinstance(self.type, float)
        ):
            raise TypeError("The column contains non numerical data.")
        return self._data.min()

    def get_mean(self):
        """
        Returns the mean value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        mean:
            the mean value
        """
        if (
            not isinstance(self.type, int)
            and not isinstance(self.type, float)
        ):
            raise TypeError("The column contains non numerical data.")
        return self._data.mean()

    def get_mode(self):
        """
        Returns the mode of the column.

        Returns
        -------
        mode:
            the mode
        """
        return self._data.mode()

    def get_median(self):
        """
        Returns the median value of the column. Raises a TypeError if the data contains non numerical data.

        Returns
        -------
        median:
            the median value
        """
        if (
            not isinstance(self.type, int)
            and not isinstance(self.type, float)
        ):
            raise TypeError("The column contains non numerical data.")
        return self._data.median()
