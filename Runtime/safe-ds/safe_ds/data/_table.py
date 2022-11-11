import pandas as pd


class Table:
    def __init__(self, data: pd.DataFrame):
        self.data = data

    def rename_column(self, oldName: str, newName: str):
        cols = self.data.columns
        if oldName not in cols:
            raise
