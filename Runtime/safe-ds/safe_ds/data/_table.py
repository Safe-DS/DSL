import pandas as pd

from _column import Column


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    def get_column_by_name(self, column_name: str):
        if column_name in self.data.columns:
            return Column(self.data[column_name].copy(deep=True))
        else:
    # Throw exception
