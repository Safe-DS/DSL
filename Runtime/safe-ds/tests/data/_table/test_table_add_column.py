import pandas as pd
import pytest

from safe_ds.data import Table, Column, StringColumnType
from safe_ds.exceptions import ColumnNameDuplicateError, ColumnSizeError


def test_table_add_column_valid() -> None:
    input = Table.from_csv("tests/resources/test_table_add_column_valid_input.csv")
    expected = Table.from_csv("tests/resources/test_table_add_column_valid_output.csv")
    column = Column(pd.Series(['a', 'b', 'c']), "C", StringColumnType())

    result = input.add_column(column)
    assert expected == result


@pytest.mark.parametrize(
    "column, column_name, error",
    [
        (['a', 'b', 'c'], "B", ColumnNameDuplicateError),
        (['a', 'b'], "C", ColumnSizeError),
    ],
)
def test_table_add_column_(column: list[str], column_name: str, error: type[Exception]) -> None:
    input = Table.from_csv("tests/resources/test_table_add_column_valid_input.csv")
    column = Column(pd.Series(column), column_name, StringColumnType())

    with pytest.raises(error):
        result = input.add_column(column)
