from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass

import numpy


@dataclass
class TableSchema:
    """Stores column names and corresponding data types for a table

    Parameters
    ----------
    column_names: list[str]
        Column names as an array
    data_types: list[numpy.dtype]
        Dataypes as an array using the numpy dtpye class

    """

    def __init__(self, column_names: list[str], data_types: list[numpy.dtype]):
        self.schema = OrderedDict()
        for column_name, data_type in zip(column_names, data_types):
            self.schema[column_name] = data_type
