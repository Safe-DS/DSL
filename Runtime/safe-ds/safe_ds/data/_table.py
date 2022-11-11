import pandas as pd
from ..exceptions import *


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

    def rename_column(self, oldName: str, newName: str) -> pd.DataFrame:
        cols = self.data.columns
        if oldName not in cols:
            raise ColumnNameError(oldName)
        if newName in cols:
            raise ColumnNameDuplicateError(newName)

        return self.data.rename(columns={oldName: newName})
