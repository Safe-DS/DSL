import pandas as pd
from safe_ds.exceptions import ColumnNameError

from ._table_schema import TableSchema


class Row:
    def __init__(self, data: pd.Series, schema: TableSchema):
        self._data: pd.Series = data
        self.schema: TableSchema = schema

    def get_value_by_column_name(self, column_name: str):
        """
        Returns the value of the column of the row.

        Parameters
        ----------
        column_name: str
            The column name

        Returns
        -------
        The value of the column
        """
        if not self.schema.has_column(column_name):
            raise ColumnNameError([column_name])
        return self._data[self.schema._get_column_index_by_name(column_name)]

    def __eq__(self, other):
        if not isinstance(other, Row):
            return NotImplemented
        elif self is other:
            return True
        else:
            return self._data.equals(other._data) and self.schema == other.schema

    def __hash__(self):
        return hash((self._data, self.schema))
