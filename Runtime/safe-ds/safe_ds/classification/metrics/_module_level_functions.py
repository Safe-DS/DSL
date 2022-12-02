from safe_ds.data import Column
from sklearn.metrics import accuracy_score


def accuracy(actual: Column, expected: Column) -> float:
    """
    Return the accuracy of two columns, from a given column to the expected column.

    Parameters
    ----------
    actual: Column
        The estimated values column
    expected: Column
        The expected values column

    Returns
    -------
    accuracy: float
        The calculated accuracy score. The percentage of equal data.
    """
    return accuracy_score(actual._data, expected._data)
