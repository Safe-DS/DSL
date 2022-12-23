import pytest
from safe_ds.data import SupervisedDataset, Table
from safe_ds.exceptions import LearningError
from safe_ds.regression import RandomForest as RandomForestRegressor


def test_random_forest_fit() -> None:
    table = Table.from_csv("tests/resources/test_random_forest.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    log_regression = RandomForestRegressor()
    log_regression.fit(supervised_dataset)
    assert True  # This asserts that the fit method succeeds


def test_random_forest_fit_invalid() -> None:
    table = Table.from_csv("tests/resources/test_random_forest_invalid.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    log_regression = RandomForestRegressor()
    with pytest.raises(LearningError):
        log_regression.fit(supervised_dataset)
