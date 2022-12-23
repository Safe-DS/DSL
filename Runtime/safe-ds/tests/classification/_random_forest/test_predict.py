import pytest
from safe_ds.classification import RandomForest as RandomForestClassifier
from safe_ds.data import SupervisedDataset, Table
from safe_ds.exceptions import PredictionError


def test_random_forest_predict():
    table = Table.from_csv("tests/resources/test_random_forest.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    log_regression = RandomForestClassifier()
    log_regression.fit(supervised_dataset)
    log_regression.predict(supervised_dataset.feature_vectors)
    assert True  # This asserts that the predict method succeeds


def test_random_forest_predict_not_fitted():
    table = Table.from_csv("tests/resources/test_random_forest.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    log_regression = RandomForestClassifier()
    with pytest.raises(PredictionError):
        log_regression.predict(supervised_dataset.feature_vectors)


def test_random_forest_predict_invalid():
    table = Table.from_csv("tests/resources/test_random_forest.csv")
    invalid_table = Table.from_csv(
        "tests/resources/test_random_forest_invalid.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    invalid_supervised_dataset = SupervisedDataset(invalid_table, "T")
    log_regression = RandomForestClassifier()
    log_regression.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        log_regression.predict(invalid_supervised_dataset.feature_vectors)


def test_random_forest_predict_invalid_target_predictions():
    table = Table.from_csv(
        "tests/resources/test_random_forest_invalid_target_predictions.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    log_regression = RandomForestClassifier()
    log_regression.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        log_regression.predict(supervised_dataset.feature_vectors)
