import pandas as pd
import pytest

from safe_ds.data import Table, Column, StringColumnType
from safe_ds.exceptions import ColumnNameDuplicateError, ColumnSizeError


def test_table_add_column_valid() -> None:
    input_table = Table.from_csv("tests/resources/test_table_add_column_valid_input.csv")
    expected = Table.from_csv("tests/resources/test_table_add_column_valid_output.csv")
    column = Column(pd.Series(['a', 'b', 'c']), "C", StringColumnType())

    result = input_table.add_column(column)
    assert expected == result


@pytest.mark.parametrize(
    "column_values, column_name, error",
    [
        (['a', 'b', 'c'], "B", ColumnNameDuplicateError),
        (['a', 'b'], "C", ColumnSizeError),
    ],
)
def test_table_add_column_(column_values: list[str], column_name: str, error: type[Exception]) -> None:
    input_table = Table.from_csv("tests/resources/test_table_add_column_valid_input.csv")
    column = Column(pd.Series(column_values), column_name, StringColumnType())

    with pytest.raises(error):
        input_table.add_column(column)
