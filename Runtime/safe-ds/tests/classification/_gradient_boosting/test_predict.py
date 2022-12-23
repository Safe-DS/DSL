import pytest

from safe_ds.classification import GradientBoosting
from safe_ds.data import SupervisedDataset, Table
from safe_ds.exceptions import PredictionError


def test_gradient_boosting_predict():
    table = Table.from_csv("tests/resources/test_gradient_boosting_classification.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    gradient_boosting = GradientBoosting()
    gradient_boosting.fit(supervised_dataset)
    gradient_boosting.predict(supervised_dataset.feature_vectors)
    assert True  # This asserts that the predict method succeeds


def test_gradient_boosting_predict_not_fitted():
    table = Table.from_csv("tests/resources/test_gradient_boosting_classification.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    gradient_boosting = GradientBoosting()
    with pytest.raises(PredictionError):
        gradient_boosting.predict(supervised_dataset.feature_vectors)


def test_gradient_boosting_predict_invalid():
    table = Table.from_csv("tests/resources/test_gradient_boosting_classification.csv")
    invalid_table = Table.from_csv(
        "tests/resources/test_gradient_boosting_classification_invalid.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    invalid_supervised_dataset = SupervisedDataset(invalid_table, "T")
    gradient_boosting = GradientBoosting()
    gradient_boosting.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        gradient_boosting.predict(invalid_supervised_dataset.feature_vectors)


def test_gradient_boosting_predict_invalid_target_predictions():
    table = Table.from_csv(
        "tests/resources/test_gradient_boosting_invalid_target_predictions.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    gradient_boosting = GradientBoosting()
    gradient_boosting.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        gradient_boosting.predict(supervised_dataset.feature_vectors)
