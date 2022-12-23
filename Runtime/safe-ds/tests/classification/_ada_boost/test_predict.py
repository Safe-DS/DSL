import pytest
from safe_ds.classification import AdaBoost
from safe_ds.data import SupervisedDataset, Table
from safe_ds.exceptions import PredictionError


def test_ada_boost_predict() -> None:
    table = Table.from_csv("tests/resources/test_ada_boost.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    ada_boost = AdaBoost()
    ada_boost.fit(supervised_dataset)
    ada_boost.predict(supervised_dataset.feature_vectors)
    assert True  # This asserts that the predict method succeeds


def test_ada_boost_predict_not_fitted() -> None:
    table = Table.from_csv("tests/resources/test_ada_boost.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    ada_boost = AdaBoost()
    with pytest.raises(PredictionError):
        ada_boost.predict(supervised_dataset.feature_vectors)


def test_ada_boost_predict_invalid() -> None:
    table = Table.from_csv("tests/resources/test_ada_boost.csv")
    invalid_table = Table.from_csv(
        "tests/resources/test_ada_boost_invalid.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    invalid_supervised_dataset = SupervisedDataset(invalid_table, "T")
    ada_boost = AdaBoost()
    ada_boost.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        ada_boost.predict(invalid_supervised_dataset.feature_vectors)


def test_ada_boost_predict_invalid_target_predictions() -> None:
    table = Table.from_csv(
        "tests/resources/test_ada_boost_invalid_target_predictions.csv"
    )
    supervised_dataset = SupervisedDataset(table, "T")
    ada_boost = AdaBoost()
    ada_boost.fit(supervised_dataset)
    with pytest.raises(PredictionError):
        ada_boost.predict(supervised_dataset.feature_vectors)
