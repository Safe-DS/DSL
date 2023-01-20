import pandas as pd

from safe_ds.data import OrdinalEncoder, Table


def test_fit_transform_valid() -> None:
    test_table = Table(
        pd.DataFrame({"temperatur": ["kalt", "kalt", "warm", "heiss"]})
    )
    oe = OrdinalEncoder(["kalt", "warm", "heiss"])
    test_table = oe.fit_transform(test_table, ["temperatur"])
    assert test_table.schema.has_column("temperatur")
    assert test_table.to_columns()[0].get_value(0) == 0
    assert test_table.to_columns()[0].get_value(1) == 0
    assert test_table.to_columns()[0].get_value(2) == 1
    assert test_table.to_columns()[0].get_value(3) == 2
