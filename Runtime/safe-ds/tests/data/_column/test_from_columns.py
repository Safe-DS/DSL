from safe_ds.data import Table, Column


def test_from_columns():
    table_expected = Table.from_csv("tests/resources/test_column_table.csv")
    columns_table: list[Column] = table_expected.to_columns()
    print(columns_table)
    table_restored: Table = Table.from_columns(columns_table)

    assert table_restored._data.equals(table_expected._data)
