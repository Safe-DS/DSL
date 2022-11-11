import pandas as pd


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    def get_row_by_index(self, index):
        """
        raise ValueError  if the index doesn't exist
        :param index:
        :return: the row for the given Index
        """
        if len(self.data.index)-1 < index | index < 0:
            raise ValueError
        return self.data.iloc[[index]]

