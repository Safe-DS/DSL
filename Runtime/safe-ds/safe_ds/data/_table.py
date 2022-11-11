import pandas as pd
from safe_ds.exceptions import ColumnNameError
from safe_ds.exceptions import ColumnNameDuplicateError


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

    def rename_column(self, old_name: str, new_name: str) -> pd.DataFrame:
        columns: [str] = self.data.columns

        if old_name not in columns:
            raise ColumnNameError(old_name)
        if new_name in columns:
            raise ColumnNameDuplicateError(new_name)

        return self.data.rename(columns={old_name: new_name})
