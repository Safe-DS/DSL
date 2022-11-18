from __future__ import annotations

import os.path
from pathlib import Path

import pandas as pd


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

    def to_json(self, path_to_file: str):
        """
        Write the data from the table into a json file.

        Parameters
        ----------
        path_to_file : The path as String to the output file. If the file does not exist it will be created. If the file does already exist it will be overwritten.
        """
        Path(os.path.dirname(path_to_file)).mkdir(parents=True, exist_ok=True)
        self._data.to_json(path_to_file)

    def to_csv(self, path_to_file: str):
        """
        Write the data from the table into a csv file.

        Parameters
        ----------
        path_to_file : The path as String to the output file. If the file does not exist it will be created. If the file does already exist it will be overwritten.
        """
        Path(os.path.dirname(path_to_file)).mkdir(parents=True, exist_ok=True)
        self._data.to_csv(path_to_file, index=False)
