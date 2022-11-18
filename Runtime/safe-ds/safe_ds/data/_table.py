from __future__ import annotations

import pandas as pd
from safe_ds.exceptions import ColumnNameDuplicateError, ColumnNameError


class Table:
    def __init__(self, data: pd.DataFrame):
        self._data: pd.DataFrame = data

    @staticmethod
    def from_json(path: str) -> Table:
        """Reads data from a JSON file into a Table

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
        """Reads data from a CSV file into a Table.

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
        """Rename a single column by providing the previous name and the future name of it.

        Parameters
        ----------
        old_name : str
            Old name of the target column
        new_name : str
            New name of the target column

        Returns
        -------
        table : Table
            The Table with the renamed column

        Raises
        ------
        ColumnNameError
            If the specified old target column name doesn't exist
        ColumnNameDuplicateError
            If the specified new target column name already exists
        """
        columns: list[str] = self._data.columns

        if old_name not in columns:
            raise ColumnNameError(old_name)
        if old_name == new_name:
            return self
        if new_name in columns:
            raise ColumnNameDuplicateError(new_name)

        return Table(self._data.rename(columns={old_name: new_name}))

    def drop_columns(self, column_names: list[str]) -> Table:
        """
        returns a Table without the given columns

        Parameters
        ----------
        column_names

        Returns
        -------
        a Table without the given columns

        Raises
        ------
        ColumnNameError
            If any of the given columns does not exist
        """
        invalid_columns = []
        for name in column_names:
            if name not in self._data.columns:
                invalid_columns.append(name)
        if len(invalid_columns) != 0:
            raise ColumnNameError(invalid_columns)
        transformed_data = self._data.drop(labels=column_names, axis='columns')
        return Table(transformed_data)

    def keep_columns(self, column_names: list[str]) -> Table:
        """
        returns a Table with exactly the given columns

        Parameters
        ----------
        column_names

        Returns
        -------
        a Table containing only the given columns

        Raises
        ------
        ColumnNameError
            If any of the given columns does not exist
        """
        invalid_columns = []
        for name in column_names:
            if name not in self._data.columns:
                invalid_columns.append(name)
        if len(invalid_columns) != 0:
            raise ColumnNameError(invalid_columns)
        transformed_data = self._data[column_names]
        return Table(transformed_data)
