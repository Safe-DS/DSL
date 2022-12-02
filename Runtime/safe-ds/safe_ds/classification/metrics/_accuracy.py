from sklearn.metrics import accuracy_score

from safe_ds.data import Column


def accuracy(actual: Column, expected: Column) -> float:
    return accuracy_score(actual._data, expected._data)
