import pandas as pd

from ._table_schema import TableSchema


class Row:
    def __init__(self, data: pd.Series, schema: TableSchema):
        self._data: pd.Series = data
        self.schema: TableSchema = schema
