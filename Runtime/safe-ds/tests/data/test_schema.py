import numpy

from safe_ds.data import Table, TableSchema
from collections import OrderedDict


def test_from_table():
    table = Table.from_json("tests/resources/test_table_read_json.json")
    assert TableSchema.from_table(table).schema == OrderedDict([("A", numpy.int64), ("B", numpy.int64)])
