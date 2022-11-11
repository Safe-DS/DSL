import pandas as pd


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    @staticmethod
    def from_json(path):
        """
        Reads data from a JSON file into a Table
        May raise other unspecified Errors.

        Parameters
        ----------
        path : String
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
            raise FileNotFoundError(f"File \"{path}\" does not exist")

    @staticmethod
    def from_csv(path):
        """
        Reads data from a CSV file into a Table.
        May raise other unspecified Errors.

        Parameters
        ----------
        path : String
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
            raise FileNotFoundError(f"File \"{path}\" does not exist")
