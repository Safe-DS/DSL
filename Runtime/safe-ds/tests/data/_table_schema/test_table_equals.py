from safe_ds.data import Table, TableSchema, IntColumnType, FloatColumnType


def test_table_equals_valid() -> None:
    table = Table.from_json("tests/resources/test_schema_table.json")
    schema_expected = TableSchema(
        {
            "A": IntColumnType(),
            "B": IntColumnType(),
        }
    )

    assert table.schema == schema_expected


def test_table_equals_invalid() -> None:
    table = Table.from_json("tests/resources/test_schema_table.json")
    schema_not_expected = TableSchema(
        {
            "A": FloatColumnType(),
            "C": IntColumnType(),
        }
    )

    assert table.schema != schema_not_expected
