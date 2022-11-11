from __future__ import annotations

import pandas as pd


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    @staticmethod
    def from_json(path: str) -> Table:
        """
        Reads data from a JSON file into a Table
        May raise other unspecified Errors.

        Parameters
        ----------
        path : str
            Path to the file as String

        Returns
        -------
            The Table read from the file

        Raises
        ------
        FileNotFoundError
            If the specified file does not exist
        """
        try:
            return Table(pd.read_json(path))
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"File \"{path}\" does not exist") from exc

    @staticmethod
    def from_csv(path: str) -> Table:
        """
        Reads data from a CSV file into a Table.
        May raise other unspecified Errors.

        Parameters
        ----------
        path : str
            Path to the file as String

        Returns
        -------
        String
            The Table read from the file

        Raises
        ------
        FileNotFoundError
            If the specified file does not exist
        """
        try:
            return Table(pd.read_csv(path))
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"File \"{path}\" does not exist") from exc
