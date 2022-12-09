import pytest

from safe_ds.data import Column, Table
from safe_ds.exceptions import DuplicateColumnNameError, UnknownColumnNameError


@pytest.mark.parametrize(
    "name_from, name_to, column_one, column_two",
    [("A", "D", "D", "B"), ("A", "A", "A", "B")],
)
def test_rename_valid(
    name_from: str, name_to: str, column_one: Column, column_two: Column
) -> None:
    table: Table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    renamed_table = table.rename_column(name_from, name_to)
    assert renamed_table._data.columns[0] == column_one
    assert renamed_table._data.columns[1] == column_two


@pytest.mark.parametrize(
    "name_from, name_to, error",
    [
        ("C", "D", UnknownColumnNameError),
        ("A", "B", DuplicateColumnNameError),
        ("D", "D", UnknownColumnNameError),
    ],
)
def test_rename_invalid(name_from: str, name_to: str, error: Exception) -> None:
    table: Table = Table.from_csv("tests/resources/test_table_read_csv.csv")
    with pytest.raises(error):
        table.rename_column(name_from, name_to)
