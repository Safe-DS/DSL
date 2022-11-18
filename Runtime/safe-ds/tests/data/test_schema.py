from collections import OrderedDict

import numpy
from safe_ds.data import Table, TableSchema


def test_from_table():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    schema_expected = OrderedDict([("A", numpy.int64), ("B", numpy.int64)])

    schema = TableSchema(table.column_names, table.data_types).schema

    assert schema == schema_expected
