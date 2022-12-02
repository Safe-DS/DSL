from sklearn.metrics import mean_squared_error as mean_squared_error_sklearn

from safe_ds.data import Column


def mean_squared_error(actual: Column, expected: Column) -> float:
    """
    Return the mean squared error, calculated from a given known_truth and a column to compare.

    Parameters
    ----------
    actual: Column
        Estimated values column
    expected
        Ground truth column

    Returns
    -------
    mean_squared_error: float
        The calculated mean squared error. The average of the distance of each individual row squared.
    """
    if not actual.get_type().is_numerical():
        raise TypeError(f"Column 'actual' is not numerical but {actual.gettype()}.")
    if not expected.get_type().is_numerical():
        raise TypeError(f"Column 'expected' is not numerical but {expected.gettype()}.")

    if actual._data.size != expected._data.size:
        raise CustomError("kaputt")

    return mean_squared_error_sklearn(expected, actual)
