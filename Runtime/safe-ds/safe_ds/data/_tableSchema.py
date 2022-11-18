from __future__ import annotations
from collections import OrderedDict
from dataclasses import dataclass

import numpy

from safe_ds.data import Table


@dataclass
class TableSchema:
    """Stores column names and corresponding data types for a table

    """
    schema: OrderedDict

    @staticmethod
    def from_table(table: Table) -> TableSchema:
        """Extracts the table schema from a given table object

        Parameters
        ----------
        table: Table
            Table to be analyzed

        Returns
        -------
        schema: TableSchema
            Schema extracted from the table

        """
        column_names: list[str] = table.column_names
        data_types: list[numpy.dtype] = table.data_types

        schema = OrderedDict()
        for i in range(len(column_names)):
            schema[column_names[i]] = data_types[i]

        return TableSchema(schema)
