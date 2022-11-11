import pandas as pd
from safe_ds.data._row import Row


class Table:
    data: pd.DataFrame

    def __init__(self, data: pd.DataFrame):
        self.data = data

    def get_row_by_index(self, index: int) -> Row:
        """
        returns the row of the Table for a given Index
        Parameters
        ----------
        index : int

        Return
        -------
        a Row of the Table
        Raises
        --------
        KeyError
            if the index doesn't exist
        """
        if len(self.data.index)-1 < index | index < 0:
            raise KeyError
        return Row(self.data.iloc[[index]])
