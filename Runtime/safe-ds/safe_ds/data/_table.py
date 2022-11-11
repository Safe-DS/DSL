import pandas as pd

from ._column import Column
from ..exceptions import ColumnNameError, ColumnNameDuplicateError


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

    def get_column_by_name(self, column_name: str):
        """
        Returns a new instance of Column with the data of the described column of the Table.
        :param column_name: the name of the column
        :return: a new instance of Column
        """
        if column_name in self.data.columns:
            return Column(self.data[column_name].copy(deep=True))
        raise ColumnNameError(column_name)
