import pandas as pd
from safe_ds.data import Row, Table


def test_add_row_valid() -> None:
    table1 = Table(pd.DataFrame(data={"col1": [1, 2, 1], "col2": [1, 2, 4]}))
    row = Row(pd.Series(data=[5, 6]), table1.schema)

    table1 = table1.add_row(row)
    assert table1.schema == row.schema
