import pandas as pd


class Table:
    def __init__(self, data: pd.DataFrame):
        self.data = data

    @staticmethod
    def from_json(path):
        try:
            return Table(pd.read_json(path))
        except FileNotFoundError:
            raise FileNotFoundError(f"File \"{path}\" does not exist")

    @staticmethod
    def from_csv(path):
        try:
            return Table(pd.read_csv(path))
        except FileNotFoundError:
            raise FileNotFoundError(f"File \"{path}\" does not exist")

    def rename_column(self, oldName: str, newName: str):
        cols = self.data.columns
        if oldName not in cols:
            raise
