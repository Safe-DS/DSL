from __future__ import annotations

import pandas as pd
from safe_ds.exceptions import ColumnNameError
from safe_ds.exceptions import ColumnNameDuplicateError


class Table:
    def __init__(self, data: pd.DataFrame):
        self._data: pd.DataFrame = data

    @staticmethod
    def from_json(path: str) -> Table:
        """
        Reads data from a JSON file into a Table

        Parameters
        ----------
        path : str
            Path to the file as String

        Returns
        -------
        table : Table
            The Table read from the file

        Raises
        ------
        FileNotFoundError
            If the specified file does not exist
        ValueError
            If the file could not be read
        """

        try:
            return Table(pd.read_json(path))
        except FileNotFoundError as exception:
            raise FileNotFoundError(f'File "{path}" does not exist') from exception
        except Exception as exception:
            raise ValueError(
                f'Could not read file from "{path}" as JSON'
            ) from exception

    @staticmethod
    def from_csv(path: str) -> Table:
        """
        Reads data from a CSV file into a Table.

        Parameters
        ----------
        path : str
            Path to the file as String

        Returns
        -------
        table : Table
            The Table read from the file

        Raises
        ------
        FileNotFoundError
            If the specified file does not exist
        ValueError
            If the file could not be read
        """

        try:
            return Table(pd.read_csv(path))
        except FileNotFoundError as exception:
            raise FileNotFoundError(f'File "{path}" does not exist') from exception
        except Exception as exception:
            raise ValueError(f'Could not read file from "{path}" as CSV') from exception

    def rename_column(self, old_name: str, new_name: str) -> Table:
        columns: list[str] = self._data.columns

        if old_name not in columns:
            raise ColumnNameError(old_name)
        if old_name == new_name:
            return self
        if new_name in columns:
            raise ColumnNameDuplicateError(new_name)

        return Table(self._data.rename(columns={old_name: new_name}))
