from safe_ds.data import Table, SupervisedDataset


def test_supervised_dataset_target_vector():
    table = Table.from_csv("tests/resources/test_supervised_dataset.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    assert supervised_dataset.target_vector._data[0] == 0
    assert supervised_dataset.target_vector._data[1] == 1


def test_supervised_dataset_feature_vectors():
    table = Table.from_csv("tests/resources/test_supervised_dataset.csv")
    supervised_dataset = SupervisedDataset(table, "T")
    assert "T" not in supervised_dataset.feature_vector._data
    assert "A" in supervised_dataset.feature_vector._data
    assert "B" in supervised_dataset.feature_vector._data
    assert "C" in supervised_dataset.feature_vector._data

