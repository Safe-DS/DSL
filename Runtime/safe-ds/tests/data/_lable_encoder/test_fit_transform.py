import pandas as pd

from safe_ds.data import LabelEncoder, Table


def test_fit_transform_valid() -> None:
    test_table = Table(pd.DataFrame({'citys': ["paris", "paris", "tokyo", "amsterdam"]}))
    le = LabelEncoder()
    assert test_table.schema.has_column("citys")
    test_table = le.fit_transform(test_table, ['citys'])
    assert test_table.schema.has_column("citys")
    assert test_table.to_columns()[0].get_value(0) == 1
    assert test_table.to_columns()[0].get_value(2) == 2
    assert test_table.to_columns()[0].get_value(3) == 0
