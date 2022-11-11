import pandas as pd


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    @staticmethod
    def from_json(path):
        """
        Reads data from a JSON file into a Table
        Raises a FileNotFoundError if the specified file does not exist.
        May raise other unspecified Errors.
        :param path: Path to the file as String
        :return: The Table read from the file
        """
        try:
            return Table(pd.read_json(path))
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"File \"{path}\" does not exist")

    @staticmethod
    def from_csv(path):
        """
        Reads data from a CSV file into a Table.
        Raises a FileNotFoundError if the specified file does not exist.
        May raise other unspecified Errors.
        :param path: Path to the file as String
        :return: The Table read from the file
        """
        try:
            return Table(pd.read_csv(path))
        except FileNotFoundError as exc:
            raise FileNotFoundError(f"File \"{path}\" does not exist")
